import { Test, TestingModule } from '@nestjs/testing';
import { CleanupStalePaymentIntentsJob } from '../cleanup-stale-payment-intents.job';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from '../../stripe/stripe.service';

describe('CleanupStalePaymentIntentsJob', () => {
  let job: CleanupStalePaymentIntentsJob;
  let prismaService: PrismaService;
  let stripeService: StripeService;

  // Mock des services
  const mockPrismaService = {
    payment: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    paymentEvent: {
      create: jest.fn(),
    },
  };

  const mockStripeService = {
    getPaymentIntent: jest.fn(),
    cancelPaymentIntent: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CleanupStalePaymentIntentsJob,
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

    job = module.get<CleanupStalePaymentIntentsJob>(CleanupStalePaymentIntentsJob);
    prismaService = module.get<PrismaService>(PrismaService);
    stripeService = module.get<StripeService>(StripeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should process stale payments correctly', async () => {
      // Mock des données de test
      const mockStalePayments = [
        {
          id: 'payment-1',
          stripe_payment_intent_id: 'pi_test_1',
          status: 'requires_payment_method',
          created_at: new Date('2024-01-01T00:00:00Z'),
          order: { id: 'order-1', status: 'DELETED' },
        },
        {
          id: 'payment-2',
          stripe_payment_intent_id: null,
          status: 'processing',
          created_at: new Date('2024-01-01T00:00:00Z'),
          order: null,
        },
      ];

      // Mock des réponses
      mockPrismaService.payment.findMany.mockResolvedValue(mockStalePayments);
      mockStripeService.getPaymentIntent.mockResolvedValue({
        id: 'pi_test_1',
        status: 'requires_payment_method',
      });
      mockStripeService.cancelPaymentIntent.mockResolvedValue({});
      mockPrismaService.paymentEvent.create.mockResolvedValue({});

      // Exécuter le job
      const result = await job.execute();

      // Vérifications
      expect(result.paymentIntentsCanceled).toBe(1);
      expect(result.paymentsUpdated).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(result.executionTime).toBeGreaterThan(0);

      // Vérifier que les paiements ont été mis à jour
      expect(mockPrismaService.payment.update).toHaveBeenCalledTimes(2);

      // Vérifier que le PaymentIntent a été annulé
      expect(mockStripeService.cancelPaymentIntent).toHaveBeenCalledWith(
        'pi_test_1',
        'abandoned'
      );
    });

    it('should handle no stale payments', async () => {
      // Mock : aucun paiement obsolète
      mockPrismaService.payment.findMany.mockResolvedValue([]);

      // Exécuter le job
      const result = await job.execute();

      // Vérifications
      expect(result.paymentIntentsCanceled).toBe(0);
      expect(result.paymentsUpdated).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle errors gracefully', async () => {
      // Mock d'une erreur
      mockPrismaService.payment.findMany.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Exécuter le job
      const result = await job.execute();

      // Vérifications
      expect(result.paymentIntentsCanceled).toBe(0);
      expect(result.paymentsUpdated).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Database connection failed');
    });

    it('should handle individual payment processing errors', async () => {
      // Mock des données avec un paiement problématique
      const mockStalePayments = [
        {
          id: 'payment-1',
          stripe_payment_intent_id: 'pi_test_1',
          status: 'requires_payment_method',
          created_at: new Date('2024-01-01T00:00:00Z'),
          order: { id: 'order-1', status: 'DELETED' },
        },
      ];

      mockPrismaService.payment.findMany.mockResolvedValue(mockStalePayments);
      mockStripeService.getPaymentIntent.mockRejectedValue(
        new Error('Stripe API error')
      );

      // Exécuter le job
      const result = await job.execute();

      // Vérifications
      expect(result.paymentIntentsCanceled).toBe(0);
      expect(result.paymentsUpdated).toBe(1); // Marqué comme annulé malgré l'erreur
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('executeManually', () => {
    it('should execute the job manually', async () => {
      // Mock des données
      mockPrismaService.payment.findMany.mockResolvedValue([]);

      // Exécuter manuellement
      const result = await job.executeManually();

      // Vérifications
      expect(result.paymentIntentsCanceled).toBe(0);
      expect(result.paymentsUpdated).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle payments with no Stripe PaymentIntent', async () => {
      const mockStalePayments = [
        {
          id: 'payment-1',
          stripe_payment_intent_id: null,
          status: 'processing',
          created_at: new Date('2024-01-01T00:00:00Z'),
          order: null,
        },
      ];

      mockPrismaService.payment.findMany.mockResolvedValue(mockStalePayments);
      mockPrismaService.paymentEvent.create.mockResolvedValue({});

      const result = await job.execute();

      expect(result.paymentIntentsCanceled).toBe(0);
      expect(result.paymentsUpdated).toBe(1);
    });

    it('should handle payments with final Stripe status', async () => {
      const mockStalePayments = [
        {
          id: 'payment-1',
          stripe_payment_intent_id: 'pi_test_1',
          status: 'processing',
          created_at: new Date('2024-01-01T00:00:00Z'),
          order: { id: 'order-1', status: 'DELETED' },
        },
      ];

      mockPrismaService.payment.findMany.mockResolvedValue(mockStalePayments);
      mockStripeService.getPaymentIntent.mockResolvedValue({
        id: 'pi_test_1',
        status: 'succeeded', // Statut final, ne doit pas être annulé
      });
      mockPrismaService.paymentEvent.create.mockResolvedValue({});

      const result = await job.execute();

      expect(result.paymentIntentsCanceled).toBe(0);
      expect(result.paymentsUpdated).toBe(1); // Synchronisé avec Stripe
    });

    it('should handle payments with non-cancelable Stripe status', async () => {
      const mockStalePayments = [
        {
          id: 'payment-1',
          stripe_payment_intent_id: 'pi_test_1',
          status: 'processing',
          created_at: new Date('2024-01-01T00:00:00Z'),
          order: { id: 'order-1', status: 'DELETED' },
        },
      ];

      mockPrismaService.payment.findMany.mockResolvedValue(mockStalePayments);
      mockStripeService.getPaymentIntent.mockResolvedValue({
        id: 'pi_test_1',
        status: 'requires_capture', // Statut non annulable
      });

      const result = await job.execute();

      expect(result.paymentIntentsCanceled).toBe(0);
      expect(result.paymentsUpdated).toBe(0); // Aucune action
    });

    it('should handle Stripe PaymentIntent not found', async () => {
      const mockStalePayments = [
        {
          id: 'payment-1',
          stripe_payment_intent_id: 'pi_test_1',
          status: 'processing',
          created_at: new Date('2024-01-01T00:00:00Z'),
          order: { id: 'order-1', status: 'DELETED' },
        },
      ];

      mockPrismaService.payment.findMany.mockResolvedValue(mockStalePayments);
      mockStripeService.getPaymentIntent.mockResolvedValue(null); // PI non trouvé
      mockPrismaService.paymentEvent.create.mockResolvedValue({});

      const result = await job.execute();

      expect(result.paymentIntentsCanceled).toBe(0);
      expect(result.paymentsUpdated).toBe(1); // Marqué comme annulé
    });

    it('should handle Stripe cancellation failure', async () => {
      const mockStalePayments = [
        {
          id: 'payment-1',
          stripe_payment_intent_id: 'pi_test_1',
          status: 'processing',
          created_at: new Date('2024-01-01T00:00:00Z'),
          order: { id: 'order-1', status: 'DELETED' },
        },
      ];

      mockPrismaService.payment.findMany.mockResolvedValue(mockStalePayments);
      mockStripeService.getPaymentIntent.mockResolvedValue({
        id: 'pi_test_1',
        status: 'requires_payment_method',
      });
      mockStripeService.cancelPaymentIntent.mockRejectedValue(
        new Error('Cancellation failed')
      );
      mockPrismaService.paymentEvent.create.mockResolvedValue({});

      const result = await job.execute();

      expect(result.paymentIntentsCanceled).toBe(0);
      expect(result.paymentsUpdated).toBe(1); // Marqué comme annulé malgré l'échec
    });
  });
});
