import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIntentInput, GetStatusInput } from './checkout.schema';
import Stripe from 'stripe';

// Mock Stripe
const mockStripeClient = {
  customers: {
    create: jest.fn(),
  },
  paymentIntents: {
    create: jest.fn(),
  },
  ephemeralKeys: {
    create: jest.fn(),
  },
};

jest.mock('../stripe/stripeClient', () => ({
  getStripeClient: jest.fn(() => mockStripeClient),
  getStripePublishableKey: jest.fn(() => 'pk_test_123'),
}));

describe('CheckoutService', () => {
  let service: CheckoutService;
  let prismaService: PrismaService;
  let mockStripe: any;

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    payment: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
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

    // Mock Stripe client
    mockStripe = mockStripeClient;
    jest.clearAllMocks();
  });

  describe('createIntent', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      stripe_customer_id: null,
    };

    const mockOrder = {
      id: 'order-123',
      user_id: 'user-123',
      status: 'PENDING',
      expires_at: new Date(Date.now() + 3600000), // 1 heure dans le futur
      amount_total_cents: 500,
      currency: 'EUR',
      items: [
        {
          subtotal_cents: 500,
        },
      ],
      user: mockUser,
    };

    const createIntentInput: CreateIntentInput = {
      orderId: 'order-123',
    };

    it('should create payment intent successfully', async () => {
      // Mock Prisma
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.payment.upsert.mockResolvedValue({});
      mockPrismaService.order.update.mockResolvedValue(mockOrder);

      // Mock Stripe
      mockStripe.customers.create.mockResolvedValue({
        id: 'cus_123',
      });
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_123',
        client_secret: 'secret_123',
        status: 'requires_payment_method',
      });
      mockStripe.ephemeralKeys.create.mockResolvedValue({
        secret: 'ek_123',
      });

      const result = await service.createIntent(createIntentInput, 'user-123');

      expect(result).toHaveProperty('publishableKey');
      expect(result).toHaveProperty('paymentIntentClientSecret');
      expect(result).toHaveProperty('customerId');
      expect(result).toHaveProperty('ephemeralKey');
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 500,
          currency: 'eur',
          customer: 'cus_123',
        }),
        expect.objectContaining({
          idempotencyKey: 'order:order-123',
        }),
      );
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.createIntent(createIntentInput, 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own the order', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.createIntent(createIntentInput, 'user-456'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if order status is not payable', async () => {
      const nonPayableOrder = { ...mockOrder, status: 'PAID' };
      mockPrismaService.order.findUnique.mockResolvedValue(nonPayableOrder);

      await expect(
        service.createIntent(createIntentInput, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if order has expired', async () => {
      const expiredOrder = {
        ...mockOrder,
        expires_at: new Date(Date.now() - 3600000),
      };
      mockPrismaService.order.findUnique.mockResolvedValue(expiredOrder);

      await expect(
        service.createIntent(createIntentInput, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if calculated amount is 0', async () => {
      const zeroAmountOrder = {
        ...mockOrder,
        items: [{ subtotal_cents: 0 }],
      };
      mockPrismaService.order.findUnique.mockResolvedValue(zeroAmountOrder);

      await expect(
        service.createIntent(createIntentInput, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update order amount if calculated amount differs', async () => {
      const orderWithDifferentAmount = {
        ...mockOrder,
        amount_total_cents: 400,
        items: [{ subtotal_cents: 500 }],
      };
      mockPrismaService.order.findUnique.mockResolvedValue(
        orderWithDifferentAmount,
      );
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.payment.upsert.mockResolvedValue({});
      mockPrismaService.order.update.mockResolvedValue(mockOrder);

      mockStripe.customers.create.mockResolvedValue({ id: 'cus_123' });
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_123',
        client_secret: 'secret_123',
        status: 'requires_payment_method',
      });
      mockStripe.ephemeralKeys.create.mockResolvedValue({ secret: 'ek_123' });

      await service.createIntent(createIntentInput, 'user-123');

      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: { amount_total_cents: 500 },
      });
    });

    it('should use existing Stripe customer if available', async () => {
      const orderWithExistingCustomer = {
        ...mockOrder,
        user: { ...mockUser, stripe_customer_id: 'cus_existing' },
      };
      mockPrismaService.order.findUnique.mockResolvedValue(
        orderWithExistingCustomer,
      );
      mockPrismaService.payment.upsert.mockResolvedValue({});
      mockPrismaService.order.update.mockResolvedValue(mockOrder);

      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_123',
        client_secret: 'secret_123',
        status: 'requires_payment_method',
      });
      mockStripe.ephemeralKeys.create.mockResolvedValue({ secret: 'ek_123' });

      await service.createIntent(createIntentInput, 'user-123');

      expect(mockStripe.customers.create).not.toHaveBeenCalled();
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_existing',
        }),
        expect.any(Object),
      );
    });

    it('should handle Stripe errors appropriately', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockStripe.customers.create.mockRejectedValue(new Error('Stripe error'));

      await expect(
        service.createIntent(createIntentInput, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getStatus', () => {
    const mockOrder = {
      id: 'order-123',
      user_id: 'user-123',
      status: 'PAID',
      amount_total_cents: 500,
      currency: 'EUR',
      paid_at: '2023-01-01T00:00:00Z',
      receipt_url: 'https://receipt.example.com',
      qr_code_token: 'qr_123',
      stripe_payment_intent_id: 'pi_123',
      payment: {
        status: 'succeeded',
      },
      user: {
        id: 'user-123',
      },
    };

    const getStatusInput: GetStatusInput = {
      orderId: 'order-123',
    };

    it('should return order status successfully', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.getStatus(getStatusInput, 'user-123');

      expect(result).toEqual({
        orderStatus: 'PAID',
        paymentStatus: 'succeeded',
        paidAt: '2023-01-01T00:00:00Z',
        receiptUrl: 'https://receipt.example.com',
        amountTotalCents: 500,
        currency: 'EUR',
        qrCodeToken: 'qr_123',
        stripePaymentIntentId: 'pi_123',
      });
    });

    it('should handle order without payment', async () => {
      const orderWithoutPayment = { ...mockOrder, payment: null };
      mockPrismaService.order.findUnique.mockResolvedValue(orderWithoutPayment);

      const result = await service.getStatus(getStatusInput, 'user-123');

      expect(result.paymentStatus).toBeNull();
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.getStatus(getStatusInput, 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user does not own the order', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.getStatus(getStatusInput, 'user-456'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should handle missing optional fields', async () => {
      const orderWithMissingFields = {
        ...mockOrder,
        paid_at: null,
        receipt_url: null,
        qr_code_token: null,
        stripe_payment_intent_id: null,
      };
      mockPrismaService.order.findUnique.mockResolvedValue(
        orderWithMissingFields,
      );

      const result = await service.getStatus(getStatusInput, 'user-123');

      expect(result.paidAt).toBeNull();
      expect(result.receiptUrl).toBeNull();
      expect(result.qrCodeToken).toBeNull();
      expect(result.stripePaymentIntentId).toBeNull();
    });
  });

  describe('isPayableStatus', () => {
    it('should return true for payable statuses', () => {
      expect(service['isPayableStatus']('PENDING')).toBe(true);
      expect(service['isPayableStatus']('FAILED')).toBe(true);
    });

    it('should return false for non-payable statuses', () => {
      expect(service['isPayableStatus']('PAID')).toBe(false);
      expect(service['isPayableStatus']('CANCELLED')).toBe(false);
      expect(service['isPayableStatus']('EXPIRED')).toBe(false);
      expect(service['isPayableStatus']('REFUNDED')).toBe(false);
    });
  });

  describe('handleStripeError', () => {
    it('should handle Stripe errors appropriately', () => {
      const error = new Error('Stripe error') as any;
      error.type = 'StripeInvalidRequestError';

      expect(() => service['handleStripeError'](error, 'order-123')).toThrow(
        BadRequestException,
      );
    });

    it('should handle unknown Stripe errors', () => {
      const error = new Error('Unknown error') as any;
      error.type = 'UnknownError';

      expect(() => service['handleStripeError'](error, 'order-123')).toThrow(
        BadRequestException,
      );
    });
  });
});
