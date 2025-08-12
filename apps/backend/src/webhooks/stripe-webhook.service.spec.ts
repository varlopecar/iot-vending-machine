import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { StripeWebhookService } from './stripe-webhook.service';
import { oncePerOrder } from '../payments/idempotency';
import { issueQrToken } from '../payments/qr';
import type Stripe from 'stripe';

// Mock des modules externes
jest.mock('../payments/idempotency');
jest.mock('../payments/qr');

const mockOncePerOrder = oncePerOrder as jest.MockedFunction<
  typeof oncePerOrder
>;
const mockIssueQrToken = issueQrToken as jest.MockedFunction<
  typeof issueQrToken
>;

describe('StripeWebhookService', () => {
  let service: StripeWebhookService;
  let inventoryService: InventoryService;

  const mockPrismaService = {
    paymentEvent: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    payment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    loyaltyLog: {
      create: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockInventoryService = {
    decrementStockForOrder: jest.fn(),
  };

  const mockTransaction = {
    payment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    loyaltyLog: {
      create: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    paymentEvent: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeWebhookService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: InventoryService,
          useValue: mockInventoryService,
        },
      ],
    }).compile();

    service = module.get<StripeWebhookService>(StripeWebhookService);
    inventoryService = module.get<InventoryService>(InventoryService);

    // Mock des variables d'environnement
    process.env.QR_SECRET = 'test-secret';
    process.env.QR_TTL_SECONDS = '600';

    // Mock des fonctions externes
    mockOncePerOrder.mockResolvedValue(true);
    mockIssueQrToken.mockReturnValue('qr_token_secure_123');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleEvent', () => {
    it('should handle payment_intent.succeeded event', async () => {
      const mockEvent = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            metadata: { orderId: 'order-123' },
          },
        },
      } as unknown as Stripe.Event;

      const mockPayment = {
        id: 'payment-123',
        order_id: 'order-123',
        amount_cents: 2500,
        currency: 'EUR',
        order: {
          user_id: 'user-123',
          machine_id: 'machine-123',
        },
      };

      mockPrismaService.paymentEvent.findUnique.mockResolvedValue(null);
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        return await fn(mockTransaction);
      });

      const result = await service.handleEvent(mockEvent);

      expect(result).toBe(true);
      expect(mockTransaction.paymentEvent.create).toHaveBeenCalledWith({
        data: {
          payment_id: 'payment-123',
          stripe_event_id: 'evt_123',
          type: 'payment_intent.succeeded',
          payload: mockEvent,
        },
      });
    });

    it('should handle payment_intent.payment_failed event', async () => {
      const mockEvent = {
        id: 'evt_456',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_456',
            metadata: { orderId: 'order-456' },
            last_payment_error: {
              code: 'card_declined',
              message: 'Card was declined',
            },
          },
        },
      } as unknown as Stripe.Event;

      const mockPayment = {
        id: 'payment-456',
        order_id: 'order-456',
        order: {
          id: 'order-456',
        },
      };

      mockPrismaService.paymentEvent.findUnique.mockResolvedValue(null);
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        return await fn(mockTransaction);
      });

      const result = await service.handleEvent(mockEvent);

      expect(result).toBe(true);
      // Vérifier que le statut est mis à jour, sans vérifier le timestamp exact
      expect(mockTransaction.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-456' },
        data: expect.objectContaining({
          status: 'failed',
          last_error_code: 'card_declined',
          last_error_message: 'Card was declined',
        }),
      });
    });

    it('should skip already processed events', async () => {
      const mockEvent = {
        id: 'evt_789',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_789',
            metadata: { orderId: 'order-789' },
          },
        },
      } as unknown as Stripe.Event;

      mockPrismaService.paymentEvent.findUnique.mockResolvedValue({
        id: 'existing-event',
      });

      const result = await service.handleEvent(mockEvent);

      expect(result).toBe(true);
      expect(mockPrismaService.payment.findUnique).not.toHaveBeenCalled();
    });

    it('should handle unknown event types gracefully', async () => {
      const mockEvent = {
        id: 'evt_999',
        type: 'unknown.event.type',
        data: {
          object: {},
        },
      } as unknown as Stripe.Event;

      mockPrismaService.paymentEvent.findUnique.mockResolvedValue(null);
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        return await fn(mockTransaction);
      });

      const result = await service.handleEvent(mockEvent);

      expect(result).toBe(true);
      expect(mockTransaction.paymentEvent.create).toHaveBeenCalled();
    });
  });

  describe('handlePaymentIntentSucceeded', () => {
    it('should process successful payment with all steps', async () => {
      const mockPaymentIntent = {
        id: 'pi_123',
        metadata: { orderId: 'order-123' },
      } as unknown as Stripe.PaymentIntent;

      const mockPayment = {
        id: 'payment-123',
        order_id: 'order-123',
        amount_cents: 2500,
        currency: 'EUR',
        order: {
          user_id: 'user-123',
          machine_id: 'machine-123',
        },
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        return await fn(mockTransaction);
      });

      const result =
        await service['handlePaymentIntentSucceeded'](mockPaymentIntent);

      expect(result).toBe(true);
      // Vérifier que le statut est mis à jour, sans vérifier le timestamp exact
      expect(mockTransaction.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-123' },
        data: expect.objectContaining({ status: 'succeeded' }),
      });
      expect(mockTransaction.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: {
          status: 'PAID',
          paid_at: expect.any(String),
          receipt_url: null,
        },
      });
      expect(inventoryService.decrementStockForOrder).toHaveBeenCalledWith(
        mockTransaction,
        'order-123',
      );
      expect(mockIssueQrToken).toHaveBeenCalledWith({
        orderId: 'order-123',
        userId: 'user-123',
        machineId: 'machine-123',
      });
      expect(mockOncePerOrder).toHaveBeenCalledWith(
        mockTransaction,
        'order-123',
        'credit_loyalty',
        expect.any(Function),
      );
    });

    it('should handle missing payment gracefully', async () => {
      const mockPaymentIntent = {
        id: 'pi_456',
        metadata: { orderId: 'order-456' },
      } as unknown as Stripe.PaymentIntent;

      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      const result =
        await service['handlePaymentIntentSucceeded'](mockPaymentIntent);

      expect(result).toBe(false);
      expect(mockPrismaService.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('handlePaymentIntentFailed', () => {
    it('should process failed payment correctly', async () => {
      const mockPaymentIntent = {
        id: 'pi_789',
        metadata: { orderId: 'order-789' },
        last_payment_error: {
          code: 'card_declined',
          message: 'Card was declined',
        },
      } as unknown as Stripe.PaymentIntent;

      const mockPayment = {
        id: 'payment-789',
        order_id: 'order-789',
        order: {
          id: 'order-789',
        },
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        return await fn(mockTransaction);
      });

      const result =
        await service['handlePaymentIntentFailed'](mockPaymentIntent);

      expect(result).toBe(true);
      // Vérifier que le statut est mis à jour, sans vérifier le timestamp exact
      expect(mockTransaction.payment.update).toHaveBeenCalledWith({
        where: { id: 'payment-789' },
        data: expect.objectContaining({
          status: 'failed',
          last_error_code: 'card_declined',
          last_error_message: 'Card was declined',
        }),
      });
      expect(mockTransaction.order.update).toHaveBeenCalledWith({
        where: { id: 'order-789' },
        data: { status: 'FAILED' },
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete payment success flow', async () => {
      const mockEvent = {
        id: 'evt_integration',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_integration',
            metadata: { orderId: 'order-integration' },
          },
        },
      } as unknown as Stripe.Event;

      const mockPayment = {
        id: 'payment-integration',
        order_id: 'order-integration',
        amount_cents: 5000, // 50 EUR
        currency: 'EUR',
        order: {
          user_id: 'user-integration',
          machine_id: 'machine-integration',
        },
      };

      mockPrismaService.paymentEvent.findUnique.mockResolvedValue(null);
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        return await fn(mockTransaction);
      });

      const result = await service.handleEvent(mockEvent);

      expect(result).toBe(true);

      // Vérifier que le QR token est généré avec les bonnes données
      expect(mockIssueQrToken).toHaveBeenCalledWith({
        orderId: 'order-integration',
        userId: 'user-integration',
        machineId: 'machine-integration',
      });

      // Vérifier que l'idempotence est utilisée pour le crédit fidélité
      expect(mockOncePerOrder).toHaveBeenCalledWith(
        mockTransaction,
        'order-integration',
        'credit_loyalty',
        expect.any(Function),
      );

      // Vérifier que le stock est décrémenté
      expect(inventoryService.decrementStockForOrder).toHaveBeenCalledWith(
        mockTransaction,
        'order-integration',
      );
    });

    it('should handle idempotence correctly for duplicate events', async () => {
      const mockEvent = {
        id: 'evt_duplicate',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_duplicate',
            metadata: { orderId: 'order-duplicate' },
          },
        },
      } as unknown as Stripe.Event;

      // Premier appel - événement traité
      mockPrismaService.paymentEvent.findUnique.mockResolvedValue(null);

      const mockPayment = {
        id: 'payment-duplicate',
        order_id: 'order-duplicate',
        amount_cents: 1000,
        currency: 'EUR',
        order: {
          user_id: 'user-duplicate',
          machine_id: 'machine-duplicate',
        },
      };

      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrismaService.$transaction.mockImplementation(async (fn) => {
        return await fn(mockTransaction);
      });

      const result1 = await service.handleEvent(mockEvent);
      expect(result1).toBe(true);

      // Deuxième appel - événement déjà traité
      mockPrismaService.paymentEvent.findUnique.mockResolvedValue({
        id: 'existing-event',
      });

      const result2 = await service.handleEvent(mockEvent);
      expect(result2).toBe(true);

      // Vérifier que les actions ne sont pas dupliquées
      expect(mockOncePerOrder).toHaveBeenCalledTimes(1);
      expect(inventoryService.decrementStockForOrder).toHaveBeenCalledTimes(1);
    });
  });
});
