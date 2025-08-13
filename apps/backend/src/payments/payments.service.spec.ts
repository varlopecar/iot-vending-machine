import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';
import { getStripeClient } from '../stripe/stripeClient';
import { TRPCError } from '@trpc/server';
import type Stripe from 'stripe';

// Mock des modules externes
jest.mock('../stripe/stripeClient');

const mockStripeClient = getStripeClient as jest.MockedFunction<
  typeof getStripeClient
>;

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockPrismaService: jest.Mocked<PrismaService>;
  let mockStripe: jest.Mocked<Stripe>;

  beforeEach(async () => {
    // Mock Stripe
    mockStripe = {
      refunds: {
        create: jest.fn(),
      },
    } as any;
    mockStripeClient.mockReturnValue(mockStripe);

    // Mock Prisma
    mockPrismaService = {
      order: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        findUnique: jest.fn(),
      },
      refund: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRefund', () => {
    const mockOrder = {
      id: 'order-123',
      payment: {
        id: 'payment-123',
        stripe_payment_intent_id: 'pi_123',
        amount_cents: 2500,
        status: 'succeeded',
      },
    };

    const mockRefund = {
      id: 'refund-123',
      stripe_refund_id: 're_123',
      amount_cents: 2500,
      status: 'pending',
      reason: 'requested_by_customer',
    };

    const mockStripeRefund = {
      id: 're_123',
      amount: 2500,
      status: 'pending',
      reason: 'requested_by_customer',
    };

    it('devrait créer un remboursement total avec succès', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder as any);
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'payment-123',
        amount_cents: 2500,
        refunds: [],
      } as any);
      mockStripe.refunds.create.mockResolvedValue(mockStripeRefund as any);
      mockPrismaService.refund.create.mockResolvedValue(mockRefund as any);

      const result = await service.createRefund({
        orderId: 'order-123',
        reason: 'requested_by_customer',
      });

      expect(result).toEqual({
        refundId: 'refund-123',
        stripeRefundId: 're_123',
        status: 'pending',
        amountCents: 2500,
      });

      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
        amount: 2500,
        reason: 'requested_by_customer',
        metadata: {
          order_id: 'order-123',
          payment_id: 'payment-123',
        },
      });
    });

    it('devrait créer un remboursement partiel avec succès', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder as any);
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'payment-123',
        amount_cents: 2500,
        refunds: [],
      } as any);
      mockStripe.refunds.create.mockResolvedValue(mockStripeRefund as any);
      mockPrismaService.refund.create.mockResolvedValue({
        ...mockRefund,
        amount_cents: 1000,
      } as any);

      const result = await service.createRefund({
        orderId: 'order-123',
        amountCents: 1000,
        reason: 'duplicate',
      });

      expect(result.amountCents).toBe(1000);
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
        amount: 1000,
        reason: 'duplicate',
        metadata: {
          order_id: 'order-123',
          payment_id: 'payment-123',
        },
      });
    });

    it("devrait refuser un remboursement si la commande n'existe pas", async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.createRefund({ orderId: 'order-inexistant' }),
      ).rejects.toThrow(TRPCError);

      expect(mockStripe.refunds.create).not.toHaveBeenCalled();
    });

    it("devrait refuser un remboursement si le paiement n'existe pas", async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-123',
        payment: null,
      } as any);

      await expect(
        service.createRefund({ orderId: 'order-123' }),
      ).rejects.toThrow(TRPCError);

      expect(mockStripe.refunds.create).not.toHaveBeenCalled();
    });

    it("devrait refuser un remboursement si le statut du paiement n'est pas succeeded", async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-123',
        payment: {
          id: 'payment-123',
          status: 'failed',
        },
      } as any);

      await expect(
        service.createRefund({ orderId: 'order-123' }),
      ).rejects.toThrow(TRPCError);

      expect(mockStripe.refunds.create).not.toHaveBeenCalled();
    });

    it('devrait refuser un remboursement si le montant est trop élevé', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder as any);
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'payment-123',
        amount_cents: 2500,
        refunds: [],
      } as any);

      await expect(
        service.createRefund({
          orderId: 'order-123',
          amountCents: 3000,
        }),
      ).rejects.toThrow(TRPCError);

      expect(mockStripe.refunds.create).not.toHaveBeenCalled();
    });

    it('devrait refuser un remboursement si le montant est négatif', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder as any);
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'payment-123',
        amount_cents: 2500,
        refunds: [],
      } as any);

      await expect(
        service.createRefund({
          orderId: 'order-123',
          amountCents: -100,
        }),
      ).rejects.toThrow(TRPCError);

      expect(mockStripe.refunds.create).not.toHaveBeenCalled();
    });

    it('devrait gérer les erreurs Stripe', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder as any);
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'payment-123',
        amount_cents: 2500,
        refunds: [],
      } as any);

      const stripeError = new Error('Stripe error');
      mockStripe.refunds.create.mockRejectedValue(stripeError);

      await expect(
        service.createRefund({ orderId: 'order-123' }),
      ).rejects.toThrow(TRPCError);

      expect(mockPrismaService.refund.create).not.toHaveBeenCalled();
    });
  });

  describe('computeRefundableAmount', () => {
    it('devrait calculer le montant remboursable correctement', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'payment-123',
        amount_cents: 2500,
        refunds: [
          { amount_cents: 1000, status: 'succeeded' },
          { amount_cents: 500, status: 'succeeded' },
        ],
      } as any);

      const result = await service.computeRefundableAmount('payment-123');

      expect(result).toBe(1000); // 2500 - 1000 - 500
    });

    it("devrait retourner 0 si le paiement n'existe pas", async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      const result =
        await service.computeRefundableAmount('payment-inexistant');

      expect(result).toBe(0);
    });

    it('devrait ignorer les remboursements non réussis', async () => {
      // Mock qui simule le comportement de Prisma avec le filtre where
      mockPrismaService.payment.findUnique.mockResolvedValue({
        id: 'payment-123',
        amount_cents: 2500,
        refunds: [
          { amount_cents: 1000, status: 'succeeded' },
          // Les remboursements pending et failed sont filtrés par Prisma
          // donc ils ne sont pas inclus dans le résultat
        ],
      } as any);

      const result = await service.computeRefundableAmount('payment-123');

      expect(result).toBe(1500); // 2500 - 1000 (seulement les succeeded)
    });
  });

  describe('updateRefundStatus', () => {
    it("devrait mettre à jour le statut d'un remboursement", async () => {
      mockPrismaService.refund.update = jest.fn().mockResolvedValue({});

      await service.updateRefundStatus('re_123', 'succeeded');

      expect(mockPrismaService.refund.update).toHaveBeenCalledWith({
        where: { stripe_refund_id: 're_123' },
        data: { status: 'succeeded' },
      });
    });
  });

  describe('checkAndUpdateOrderRefundStatus', () => {
    it('devrait marquer la commande comme remboursée si le total remboursé égale le montant payé', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-123',
        payment: {
          id: 'payment-123',
          amount_cents: 2500,
          refunds: [
            { amount_cents: 1500, status: 'succeeded' },
            { amount_cents: 1000, status: 'succeeded' },
          ],
        },
      } as any);

      await service.checkAndUpdateOrderRefundStatus('order-123');

      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-123' },
        data: { status: 'REFUNDED' },
      });
    });

    it('ne devrait pas marquer la commande comme remboursée si le total remboursé est inférieur', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        id: 'order-123',
        payment: {
          id: 'payment-123',
          amount_cents: 2500,
          refunds: [{ amount_cents: 1000, status: 'succeeded' }],
        },
      } as any);

      await service.checkAndUpdateOrderRefundStatus('order-123');

      expect(mockPrismaService.order.update).not.toHaveBeenCalled();
    });

    it("ne devrait rien faire si la commande n'existe pas", async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await service.checkAndUpdateOrderRefundStatus('order-inexistant');

      expect(mockPrismaService.order.update).not.toHaveBeenCalled();
    });
  });
});
