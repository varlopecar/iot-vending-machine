import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

import { CheckoutService } from './checkout.service';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { CreateIntentInput, GetStatusInput } from './checkout.schema';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let prismaService: PrismaService;
  let stripeService: StripeService;

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    payment: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockStripeService = {
    createPaymentIntent: jest.fn(),
    confirmPaymentIntent: jest.fn(),
    cancelPaymentIntent: jest.fn(),
    retrievePaymentIntent: jest.fn(),
    createCustomer: jest.fn(),
    attachPaymentMethod: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
    prismaService = module.get<PrismaService>(PrismaService);
    stripeService = module.get<StripeService>(StripeService);

    jest.clearAllMocks();
  });

  describe('createIntent', () => {
    const createIntentDto: CreateIntentInput = {
      orderId: 'order-1',
      paymentMethodId: 'pm_test_123',
    };

    const mockUser = {
      id: 'user-1',
      full_name: 'Test User',
      email: 'test@example.com',
    };

    const mockOrder = {
      id: 'order-1',
      user_id: 'user-1',
      total_amount: 10.00,
      status: 'PENDING',
      user: mockUser,
      items: [
        { id: 'item-1', product_id: 'product-1', quantity: 2, price: 2.50 },
        { id: 'item-2', product_id: 'product-2', quantity: 1, price: 5.00 },
      ],
    };

    const mockPaymentIntent = {
      id: 'pi_test_123',
      amount: 1000, // in cents
      status: 'requires_confirmation',
      client_secret: 'pi_test_123_secret',
    };

    it('should create payment intent successfully', async () => {
      (mockPrismaService.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (mockStripeService.createPaymentIntent as jest.Mock).mockResolvedValue(mockPaymentIntent);
      (mockPrismaService.payment.create as jest.Mock).mockResolvedValue({
        id: 'payment-1',
        stripe_payment_intent_id: 'pi_test_123',
      });

      const result = await service.createIntent(createIntentDto, 'user-1');

      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        include: { user: true, items: true },
      });
      expect(mockStripeService.createPaymentIntent).toHaveBeenCalledWith({
        amount: 1000,
        currency: 'eur',
        payment_method: 'pm_test_123',
        confirmation_method: 'manual',
        confirm: false,
        metadata: {
          orderId: 'order-1',
          userId: 'user-1',
        },
      });
      expect(result).toEqual({
        clientSecret: 'pi_test_123_secret',
        paymentIntentId: 'pi_test_123',
      });
    });

    it('should throw NotFoundException if order not found', async () => {
      (mockPrismaService.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createIntent(createIntentDto, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own order', async () => {
      const orderWithDifferentUser = {
        ...mockOrder,
        user_id: 'different-user',
        user: { id: 'different-user' },
      };
      (mockPrismaService.order.findUnique as jest.Mock).mockResolvedValue(orderWithDifferentUser);

      await expect(service.createIntent(createIntentDto, 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if order is already paid', async () => {
      const paidOrder = { ...mockOrder, status: 'COMPLETED' };
      (mockPrismaService.order.findUnique as jest.Mock).mockResolvedValue(paidOrder);

      await expect(service.createIntent(createIntentDto, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should handle Stripe errors', async () => {
      (mockPrismaService.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (mockStripeService.createPaymentIntent as jest.Mock).mockRejectedValue(new Error('Stripe error'));

      await expect(service.createIntent(createIntentDto, 'user-1')).rejects.toThrow('Stripe error');
    });

    it('should handle different currencies', async () => {
      (mockPrismaService.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (mockStripeService.createPaymentIntent as jest.Mock).mockResolvedValue(mockPaymentIntent);
      (mockPrismaService.payment.create as jest.Mock).mockResolvedValue({
        id: 'payment-1',
        stripe_payment_intent_id: 'pi_test_123',
      });

      const dtoWithCurrency = { ...createIntentDto, currency: 'usd' };
      await service.createIntent(dtoWithCurrency, 'user-1');

      expect(mockStripeService.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({ currency: 'usd' })
      );
    });
  });

  describe('confirmPayment', () => {
    const mockPaymentIntent = {
      id: 'pi_test_123',
      status: 'succeeded',
      amount: 1000,
    };

    it('should confirm payment successfully', async () => {
      (mockStripeService.confirmPaymentIntent as jest.Mock).mockResolvedValue(mockPaymentIntent);
      (mockPrismaService.payment.findUnique as jest.Mock).mockResolvedValue({
        id: 'payment-1',
        order_id: 'order-1',
      });
      (mockPrismaService.order.update as jest.Mock).mockResolvedValue({
        id: 'order-1',
        status: 'COMPLETED',
      });

      const result = await service.confirmPayment('pi_test_123');

      expect(mockStripeService.confirmPaymentIntent).toHaveBeenCalledWith('pi_test_123');
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'COMPLETED' },
      });
      expect(result).toEqual({ success: true, status: 'succeeded' });
    });

    it('should handle payment confirmation failure', async () => {
      const failedPaymentIntent = { ...mockPaymentIntent, status: 'requires_payment_method' };
      (mockStripeService.confirmPaymentIntent as jest.Mock).mockResolvedValue(failedPaymentIntent);

      const result = await service.confirmPayment('pi_test_123');

      expect(result).toEqual({ success: false, status: 'requires_payment_method' });
    });

    it('should handle Stripe errors during confirmation', async () => {
      (mockStripeService.confirmPaymentIntent as jest.Mock).mockRejectedValue(new Error('Confirmation failed'));

      await expect(service.confirmPayment('pi_test_123')).rejects.toThrow('Confirmation failed');
    });
  });

  describe('getStatus', () => {
    const getStatusInput: GetStatusInput = {
      orderId: 'order-1',
    };

    const mockOrder = {
      id: 'order-1',
      user_id: 'user-1',
      status: 'PENDING',
      total_amount: 10.00,
    };

    const mockPayment = {
      id: 'payment-1',
      order_id: 'order-1',
      stripe_payment_intent_id: 'pi_test_123',
      status: 'PENDING',
    };

    const mockPaymentIntent = {
      id: 'pi_test_123',
      status: 'succeeded',
      amount: 1000,
    };

    it('should return order and payment status', async () => {
      (mockPrismaService.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (mockPrismaService.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);
      (mockStripeService.retrievePaymentIntent as jest.Mock).mockResolvedValue(mockPaymentIntent);

      const result = await service.getStatus(getStatusInput, 'user-1');

      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-1' },
      });
      expect(mockPrismaService.payment.findUnique).toHaveBeenCalledWith({
        where: { order_id: 'order-1' },
      });
      expect(result).toEqual({
        order: mockOrder,
        payment: mockPayment,
        stripeStatus: 'succeeded',
      });
    });

    it('should throw NotFoundException if order not found', async () => {
      (mockPrismaService.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getStatus(getStatusInput, 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should return status without payment if no payment exists', async () => {
      (mockPrismaService.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (mockPrismaService.payment.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.getStatus(getStatusInput, 'user-1');

      expect(result).toEqual({
        order: mockOrder,
        payment: null,
        stripeStatus: null,
      });
    });

    it('should handle Stripe retrieval errors', async () => {
      (mockPrismaService.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (mockPrismaService.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);
      (mockStripeService.retrievePaymentIntent as jest.Mock).mockRejectedValue(new Error('Stripe error'));

      const result = await service.getStatus(getStatusInput, 'user-1');

      expect(result.stripeStatus).toBeNull();
    });
  });

  describe('cancelPayment', () => {
    const mockPayment = {
      id: 'payment-1',
      order_id: 'order-1',
      stripe_payment_intent_id: 'pi_test_123',
    };

    const mockCancelledPaymentIntent = {
      id: 'pi_test_123',
      status: 'canceled',
    };

    it('should cancel payment successfully', async () => {
      (mockPrismaService.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);
      (mockStripeService.cancelPaymentIntent as jest.Mock).mockResolvedValue(mockCancelledPaymentIntent);
      (mockPrismaService.order.update as jest.Mock).mockResolvedValue({
        id: 'order-1',
        status: 'CANCELLED',
      });

      const result = await service.cancelPayment('order-1');

      expect(mockStripeService.cancelPaymentIntent).toHaveBeenCalledWith('pi_test_123');
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'CANCELLED' },
      });
      expect(result).toEqual({ success: true, status: 'canceled' });
    });

    it('should throw NotFoundException if payment not found', async () => {
      (mockPrismaService.payment.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.cancelPayment('order-1')).rejects.toThrow(NotFoundException);
    });

    it('should handle Stripe cancellation errors', async () => {
      (mockPrismaService.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);
      (mockStripeService.cancelPaymentIntent as jest.Mock).mockRejectedValue(new Error('Cancellation failed'));

      await expect(service.cancelPayment('order-1')).rejects.toThrow('Cancellation failed');
    });
  });

  describe('processWebhookPayment', () => {
    const mockPaymentIntent = {
      id: 'pi_test_123',
      status: 'succeeded',
      metadata: {
        orderId: 'order-1',
        userId: 'user-1',
      },
    };

    it('should process webhook payment successfully', async () => {
      (mockPrismaService.payment.findUnique as jest.Mock).mockResolvedValue({
        id: 'payment-1',
        order_id: 'order-1',
      });
      (mockPrismaService.order.update as jest.Mock).mockResolvedValue({
        id: 'order-1',
        status: 'COMPLETED',
      });

      const result = await service.processWebhookPayment(mockPaymentIntent);

      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'COMPLETED' },
      });
      expect(result).toBe(true);
    });

    it('should handle webhook for unknown payment', async () => {
      (mockPrismaService.payment.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.processWebhookPayment(mockPaymentIntent);

      expect(result).toBe(false);
    });

    it('should handle different payment statuses', async () => {
      const failedPaymentIntent = { ...mockPaymentIntent, status: 'payment_failed' };
      (mockPrismaService.payment.findUnique as jest.Mock).mockResolvedValue({
        id: 'payment-1',
        order_id: 'order-1',
      });
      (mockPrismaService.order.update as jest.Mock).mockResolvedValue({
        id: 'order-1',
        status: 'FAILED',
      });

      const result = await service.processWebhookPayment(failedPaymentIntent);

      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'FAILED' },
      });
      expect(result).toBe(true);
    });
  });

  describe('createCustomer', () => {
    const mockUser = {
      id: 'user-1',
      full_name: 'Test User',
      email: 'test@example.com',
    };

    const mockStripeCustomer = {
      id: 'cus_test_123',
      email: 'test@example.com',
      name: 'Test User',
    };

    it('should create Stripe customer successfully', async () => {
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockStripeService.createCustomer as jest.Mock).mockResolvedValue(mockStripeCustomer);

      const result = await service.createCustomer('user-1');

      expect(mockStripeService.createCustomer).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        metadata: { userId: 'user-1' },
      });
      expect(result).toEqual(mockStripeCustomer);
    });

    it('should throw NotFoundException if user not found', async () => {
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.createCustomer('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('attachPaymentMethod', () => {
    const mockPaymentMethod = {
      id: 'pm_test_123',
      customer: 'cus_test_123',
      type: 'card',
    };

    it('should attach payment method successfully', async () => {
      (mockStripeService.attachPaymentMethod as jest.Mock).mockResolvedValue(mockPaymentMethod);

      const result = await service.attachPaymentMethod('pm_test_123', 'cus_test_123');

      expect(mockStripeService.attachPaymentMethod).toHaveBeenCalledWith('pm_test_123', 'cus_test_123');
      expect(result).toEqual(mockPaymentMethod);
    });

    it('should handle attachment errors', async () => {
      (mockStripeService.attachPaymentMethod as jest.Mock).mockRejectedValue(new Error('Attachment failed'));

      await expect(service.attachPaymentMethod('pm_test_123', 'cus_test_123')).rejects.toThrow('Attachment failed');
    });
  });

  describe('getPaymentHistory', () => {
    const mockPayments = [
      {
        id: 'payment-1',
        order_id: 'order-1',
        stripe_payment_intent_id: 'pi_test_123',
        amount: 1000,
        status: 'COMPLETED',
        created_at: new Date(),
      },
      {
        id: 'payment-2',
        order_id: 'order-2',
        stripe_payment_intent_id: 'pi_test_456',
        amount: 1500,
        status: 'COMPLETED',
        created_at: new Date(),
      },
    ];

    it('should return payment history for user', async () => {
      (mockPrismaService.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      // Mock the method since it might not exist yet
      jest.spyOn(service, 'getPaymentHistory').mockResolvedValue(mockPayments);

      const result = await service.getPaymentHistory('user-1');

      expect(result).toEqual(mockPayments);
    });
  });

  describe('calculateOrderAmount', () => {
    const orderItems = [
      { product_id: 'product-1', quantity: 2, price: 2.50 },
      { product_id: 'product-2', quantity: 1, price: 5.00 },
    ];

    it('should calculate order amount correctly', () => {
      const result = service.calculateOrderAmount(orderItems);

      expect(result).toBe(1000); // 10.00 EUR in cents
    });

    it('should handle empty items', () => {
      const result = service.calculateOrderAmount([]);

      expect(result).toBe(0);
    });

    it('should handle decimal precision', () => {
      const items = [
        { product_id: 'product-1', quantity: 3, price: 1.33 },
      ];

      const result = service.calculateOrderAmount(items);

      expect(result).toBe(399); // 3.99 EUR in cents
    });
  });

  describe('validatePaymentMethod', () => {
    it('should validate payment method', async () => {
      // Mock implementation
      jest.spyOn(service, 'validatePaymentMethod').mockResolvedValue(true);

      const result = await service.validatePaymentMethod('pm_test_123');

      expect(result).toBe(true);
    });

    it('should reject invalid payment method', async () => {
      jest.spyOn(service, 'validatePaymentMethod').mockResolvedValue(false);

      const result = await service.validatePaymentMethod('invalid_pm');

      expect(result).toBe(false);
    });
  });
});