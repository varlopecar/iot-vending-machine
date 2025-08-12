import { Test, TestingModule } from '@nestjs/testing';
import { CheckoutService } from './checkout.service';
import { PrismaService } from '../prisma/prisma.service';
import { getStripeClient, getStripePublishableKey } from '../stripe/stripeClient';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import Stripe from 'stripe';

// Mock des modules externes
jest.mock('../stripe/stripeClient');
jest.mock('../prisma/prisma.service');

describe('CheckoutService', () => {
  let service: CheckoutService;
  let prismaService: jest.Mocked<PrismaService>;
  let mockStripe: jest.Mocked<Stripe>;

  const mockOrder = {
    id: 'order-123',
    user_id: 'user-123',
    status: 'PENDING',
    amount_total_cents: 2500,
    currency: 'EUR',
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    qr_code_token: 'qr-token-123',
    items: [
      {
        id: 'item-1',
        subtotal_cents: 1500,
        unit_price_cents: 1500,
        quantity: 1,
        slot_number: 1,
        product_id: 'product-1',
        order_id: 'order-123',
        label: 'Coca-Cola',
      },
      {
        id: 'item-2',
        subtotal_cents: 1000,
        unit_price_cents: 1000,
        quantity: 1,
        slot_number: 2,
        product_id: 'product-2',
        order_id: 'order-123',
        label: 'Chips',
      },
    ],
    user: {
      id: 'user-123',
      email: 'test@example.com',
      stripe_customer_id: null,
    },
  };

  const mockPaymentIntent = {
    id: 'pi_123',
    client_secret: 'pi_123_secret',
    status: 'requires_payment_method',
    amount: 2500,
    currency: 'eur',
  };

  const mockEphemeralKey = {
    secret: 'ek_test_123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        {
          provide: PrismaService,
          useValue: {
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
            $transaction: jest.fn((callback) => callback({
              payment: { upsert: jest.fn() },
              order: { update: jest.fn() },
            })),
          },
        },
      ],
    }).compile();

    service = module.get<CheckoutService>(CheckoutService);
    prismaService = module.get(PrismaService);

    // Mock Stripe
    mockStripe = {
      customers: {
        create: jest.fn().mockResolvedValue({ id: 'cus_123' }),
      },
      paymentIntents: {
        create: jest.fn().mockResolvedValue(mockPaymentIntent),
      },
      ephemeralKeys: {
        create: jest.fn().mockResolvedValue(mockEphemeralKey),
      },
    } as any;

    // Mock des méthodes Prisma
    prismaService.order.findUnique.mockResolvedValue(mockOrder as any);
    prismaService.order.update.mockResolvedValue(mockOrder as any);
    prismaService.user.update.mockResolvedValue({} as any);
    prismaService.payment.upsert.mockResolvedValue({} as any);

    (getStripeClient as jest.Mock).mockReturnValue(mockStripe);
    (getStripePublishableKey as jest.Mock).mockReturnValue('pk_test_123');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createIntent', () => {
    it('should create payment intent successfully', async () => {
      // Reset mock pour ce test spécifique
      prismaService.order.findUnique.mockResolvedValue(mockOrder as any);

      const result = await service.createIntent({ orderId: 'order-123' }, 'user-123');

      expect(result).toEqual({
        publishableKey: 'pk_test_123',
        paymentIntentClientSecret: 'pi_123_secret',
        customerId: 'cus_123',
        ephemeralKey: 'ek_test_123',
      });

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        metadata: { userId: 'user-123' },
      });

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 2500,
        currency: 'eur',
        customer: 'cus_123',
        automatic_payment_methods: { enabled: true },
        metadata: {
          orderId: 'order-123',
          userId: 'user-123',
        },
      }, {
        idempotencyKey: 'order:order-123',
      });
    });

    it('should throw NotFoundException when order not found', async () => {
      prismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.createIntent({ orderId: 'invalid-order' }, 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      prismaService.order.findUnique.mockResolvedValue(mockOrder as any);

      await expect(
        service.createIntent({ orderId: 'order-123' }, 'different-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when order status is not payable', async () => {
      const nonPayableOrder = { ...mockOrder, status: 'PAID' };
      prismaService.order.findUnique.mockResolvedValue(nonPayableOrder as any);

      await expect(
        service.createIntent({ orderId: 'order-123' }, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when order is expired', async () => {
      const expiredOrder = { ...mockOrder, expires_at: new Date(Date.now() - 1000).toISOString() };
      prismaService.order.findUnique.mockResolvedValue(expiredOrder as any);

      await expect(
        service.createIntent({ orderId: 'order-123' }, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when amount is 0', async () => {
      const zeroAmountOrder = { ...mockOrder, items: [] };
      prismaService.order.findUnique.mockResolvedValue(zeroAmountOrder as any);

      await expect(
        service.createIntent({ orderId: 'order-123' }, 'user-123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update order amount if different from calculated amount', async () => {
      const orderWithDifferentAmount = { ...mockOrder, amount_total_cents: 3000 };
      prismaService.order.findUnique.mockResolvedValue(orderWithDifferentAmount as any);

      await service.createIntent({ orderId: 'order-123' }, 'user-123');

      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: { amount_total_cents: 2500 },
      });
    });

    it('should use existing stripe customer id if available', async () => {
      const orderWithStripeCustomer = {
        ...mockOrder,
        user: { ...mockOrder.user, stripe_customer_id: 'cus_existing' },
      };
      prismaService.order.findUnique.mockResolvedValue(orderWithStripeCustomer as any);

      await service.createIntent({ orderId: 'order-123' }, 'user-123');

      expect(mockStripe.customers.create).not.toHaveBeenCalled();
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({ customer: 'cus_existing' }),
        expect.any(Object),
      );
    });
  });

  describe('getStatus', () => {
    it('should return order status successfully', async () => {
      const orderWithPayment = {
        ...mockOrder,
        payment: {
          id: 'payment-123',
          status: 'requires_payment_method',
        },
      };
      prismaService.order.findUnique.mockResolvedValue(orderWithPayment as any);

      const result = await service.getStatus({ orderId: 'order-123' }, 'user-123');

      expect(result).toEqual({
        orderStatus: 'PENDING',
        paymentStatus: 'requires_payment_method',
        paidAt: null,
        receiptUrl: null,
        amountTotalCents: 2500,
        currency: 'EUR',
        qrCodeToken: 'qr-token-123',
        stripePaymentIntentId: null,
      });
    });

    it('should throw NotFoundException when order not found', async () => {
      prismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.getStatus({ orderId: 'invalid-order' }, 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      prismaService.order.findUnique.mockResolvedValue(mockOrder as any);

      await expect(
        service.getStatus({ orderId: 'order-123' }, 'different-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
