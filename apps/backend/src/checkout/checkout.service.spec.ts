import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  getStripeClient,
  getStripePublishableKey,
} from '../stripe/stripeClient';
import type Stripe from 'stripe';

// Mock des modules externes
jest.mock('../stripe/stripeClient');

describe('CheckoutService', () => {
  let service: CheckoutService;
  let prismaService: PrismaService;
  let mockStripe: any;

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      upsert: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockStripeClient = {
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    paymentIntents: {
      create: jest.fn(),
    },
    ephemeralKeys: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Mock Stripe - IMPORTANT: Mocker AVANT que le service soit instancié
    mockStripe = mockStripeClient;
    (getStripeClient as jest.Mock).mockReturnValue(mockStripe);
    (getStripePublishableKey as jest.Mock).mockReturnValue('pk_test_123');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createIntent', () => {
    const validInput = { orderId: 'order-123' };
    const currentUserId = 'user-123';

    const mockOrder = {
      id: 'order-123',
      user_id: 'user-123',
      machine_id: 'machine-456',
      status: 'PENDING',
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
      currency: 'EUR',
      amount_total_cents: 2500,
      items: [
        {
          product_id: 'product-1',
          quantity: 2,
          unit_price_cents: 1250,
          subtotal_cents: 2500,
        },
      ],
      user: {
        id: 'user-123',
        email: 'test@example.com',
        stripe_customer_id: null,
      },
    };

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      stripe_customer_id: null,
    };

    it('should create payment intent successfully', async () => {
      // Mock des données
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockStripe.customers.create.mockResolvedValue({
        id: 'cus_new_123',
        email: 'test@example.com',
      });
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_123',
        client_secret: 'pi_123_secret',
      });
      mockStripe.ephemeralKeys.create.mockResolvedValue({
        secret: 'ek_test_123',
      });
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        return await fn(mockPrismaService);
      });

      const result = await service.createIntent(validInput, currentUserId);

      expect(result).toEqual({
        publishableKey: 'pk_test_123',
        paymentIntentClientSecret: 'pi_123_secret',
        customerId: 'cus_new_123',
        ephemeralKey: 'ek_test_123',
      });

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        metadata: { userId: 'user-123' },
      });
    });

    it('should use existing stripe customer id if available', async () => {
      const existingUserOrder = {
        ...mockOrder,
        user: {
          ...mockOrder.user,
          stripe_customer_id: 'cus_existing',
        },
      };

      mockPrismaService.order.findUnique.mockResolvedValue(existingUserOrder);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_456',
        client_secret: 'pi_456_secret',
      });
      mockStripe.ephemeralKeys.create.mockResolvedValue({
        secret: 'ek_test_456',
      });
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        return await fn(mockPrismaService);
      });

      const result = await service.createIntent(validInput, currentUserId);

      expect(result).toEqual({
        publishableKey: 'pk_test_123',
        paymentIntentClientSecret: 'pi_456_secret',
        customerId: 'cus_existing',
        ephemeralKey: 'ek_test_456',
      });

      expect(mockStripe.customers.create).not.toHaveBeenCalled();
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({ customer: 'cus_existing' }),
        expect.any(Object),
      );
    });

    it('should throw error when order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.createIntent(validInput, currentUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when order does not belong to user', async () => {
      const wrongUserOrder = {
        ...mockOrder,
        user_id: 'user-456', // Different user
      };

      mockPrismaService.order.findUnique.mockResolvedValue(wrongUserOrder);

      await expect(
        service.createIntent(validInput, currentUserId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw error when order status is not payable', async () => {
      const nonPayableOrder = {
        ...mockOrder,
        status: 'PAID', // Already paid
      };

      mockPrismaService.order.findUnique.mockResolvedValue(nonPayableOrder);

      await expect(
        service.createIntent(validInput, currentUserId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error when order is expired', async () => {
      const expiredOrder = {
        ...mockOrder,
        expires_at: new Date(Date.now() - 60 * 1000).toISOString(), // 1 minute ago
      };

      mockPrismaService.order.findUnique.mockResolvedValue(expiredOrder);

      await expect(
        service.createIntent(validInput, currentUserId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getStatus', () => {
    const validInput = { orderId: 'order-123' };
    const currentUserId = 'user-123';

    const mockOrder = {
      id: 'order-123',
      user_id: 'user-123',
      status: 'REQUIRES_PAYMENT',
      amount_total_cents: 2500,
      currency: 'EUR',
      qr_code_token: 'qr_123',
      payment: {
        stripe_payment_intent_id: 'pi_123',
        status: 'requires_payment_method',
        paid_at: null,
        receipt_url: null,
      },
    };

    it('should return order status successfully', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.getStatus(validInput, currentUserId);

      expect(result).toEqual({
        orderStatus: 'REQUIRES_PAYMENT',
        paymentStatus: 'requires_payment_method',
        paidAt: null,
        receiptUrl: null,
        amountTotalCents: 2500,
        currency: 'EUR',
        qrCodeToken: 'qr_123',
        stripePaymentIntentId: 'pi_123',
      });
    });

    it('should throw error when order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.getStatus(validInput, currentUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when order does not belong to user', async () => {
      const wrongUserOrder = {
        ...mockOrder,
        user_id: 'user-456', // Different user
      };

      mockPrismaService.order.findUnique.mockResolvedValue(wrongUserOrder);

      await expect(
        service.getStatus(validInput, currentUserId),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
