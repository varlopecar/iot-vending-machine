import { Test, TestingModule } from '@nestjs/testing';
import { ExpireStaleOrdersJob } from '../expire-stale-orders.job';
import { PrismaService } from '../../prisma/prisma.service';
import { StripeService } from '../../stripe/stripe.service';
import { ReservationsService } from '../../inventory/reservations.service';

describe('ExpireStaleOrdersJob', () => {
  let job: ExpireStaleOrdersJob;
  let prismaService: PrismaService;
  let stripeService: StripeService;
  let reservationsService: ReservationsService;

  // Mock des services
  const mockPrismaService = {
    order: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      update: jest.fn(),
    },
    paymentEvent: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockStripeService = {
    getPaymentIntent: jest.fn(),
    cancelPaymentIntent: jest.fn(),
  };

  const mockReservationsService = {
    releaseReservedStockForOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpireStaleOrdersJob,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
        {
          provide: ReservationsService,
          useValue: mockReservationsService,
        },
      ],
    }).compile();

    job = module.get<ExpireStaleOrdersJob>(ExpireStaleOrdersJob);
    prismaService = module.get<PrismaService>(PrismaService);
    stripeService = module.get<StripeService>(StripeService);
    reservationsService = module.get<ReservationsService>(ReservationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should process expired orders correctly', async () => {
      // Mock des données de test
      const mockExpiredOrders = [
        {
          id: 'order-1',
          status: 'PENDING',
          expires_at: new Date('2024-01-01T00:00:00Z'),
          items: [{ product_id: 'prod-1', quantity: 2 }],
          payments: [
            {
              id: 'payment-1',
              stripe_payment_intent_id: 'pi_test_1',
              status: 'requires_payment_method',
            },
          ],
        },
        {
          id: 'order-2',
          status: 'REQUIRES_PAYMENT',
          expires_at: new Date('2024-01-01T00:00:00Z'),
          items: [{ product_id: 'prod-2', quantity: 1 }],
          payments: [],
        },
      ];

      // Mock des réponses
      mockPrismaService.order.findMany.mockResolvedValue(mockExpiredOrders);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrismaService);
      });
      mockStripeService.getPaymentIntent.mockResolvedValue({
        id: 'pi_test_1',
        status: 'requires_payment_method',
      });
      mockStripeService.cancelPaymentIntent.mockResolvedValue({});
      mockReservationsService.releaseReservedStockForOrder.mockResolvedValue(2);
      mockPrismaService.paymentEvent.create.mockResolvedValue({});

      // Exécuter le job
      const result = await job.execute();

      // Vérifications
      expect(result.ordersExpired).toBe(2);
      expect(result.paymentIntentsCanceled).toBe(1);
      expect(result.stockReleased).toBe(4); // 2 + 2
      expect(result.errors).toHaveLength(0);
      expect(result.executionTime).toBeGreaterThan(0);

      // Vérifier que les commandes ont été mises à jour
      expect(mockPrismaService.order.update).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'EXPIRED', updated_at: expect.any(Date) },
      });

      // Vérifier que le stock a été libéré
      expect(mockReservationsService.releaseReservedStockForOrder).toHaveBeenCalledTimes(2);

      // Vérifier que les PaymentIntents ont été annulés
      expect(mockStripeService.cancelPaymentIntent).toHaveBeenCalledWith(
        'pi_test_1',
        'abandoned'
      );
    });

    it('should handle no expired orders', async () => {
      // Mock : aucune commande expirée
      mockPrismaService.order.findMany.mockResolvedValue([]);

      // Exécuter le job
      const result = await job.execute();

      // Vérifications
      expect(result.ordersExpired).toBe(0);
      expect(result.paymentIntentsCanceled).toBe(0);
      expect(result.stockReleased).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle errors gracefully', async () => {
      // Mock d'une erreur
      mockPrismaService.order.findMany.mockRejectedValue(
        new Error('Database connection failed')
      );

      // Exécuter le job
      const result = await job.execute();

      // Vérifications
      expect(result.ordersExpired).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Database connection failed');
    });

    it('should handle individual order processing errors', async () => {
      // Mock des données avec une commande problématique
      const mockExpiredOrders = [
        {
          id: 'order-1',
          status: 'PENDING',
          expires_at: new Date('2024-01-01T00:00:00Z'),
          items: [],
          payments: [],
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(mockExpiredOrders);
      mockPrismaService.$transaction.mockRejectedValue(
        new Error('Transaction failed')
      );

      // Exécuter le job
      const result = await job.execute();

      // Vérifications
      expect(result.ordersExpired).toBe(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Transaction failed');
    });
  });

  describe('executeManually', () => {
    it('should execute the job manually', async () => {
      // Mock des données
      mockPrismaService.order.findMany.mockResolvedValue([]);

      // Exécuter manuellement
      const result = await job.executeManually();

      // Vérifications
      expect(result.ordersExpired).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle orders with no payments', async () => {
      const mockExpiredOrders = [
        {
          id: 'order-1',
          status: 'PENDING',
          expires_at: new Date('2024-01-01T00:00:00Z'),
          items: [{ product_id: 'prod-1', quantity: 1 }],
          payments: [],
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(mockExpiredOrders);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrismaService);
      });
      mockReservationsService.releaseReservedStockForOrder.mockResolvedValue(1);
      mockPrismaService.paymentEvent.create.mockResolvedValue({});

      const result = await job.execute();

      expect(result.ordersExpired).toBe(1);
      expect(result.paymentIntentsCanceled).toBe(0);
      expect(result.stockReleased).toBe(1);
    });

    it('should handle orders with failed payments', async () => {
      const mockExpiredOrders = [
        {
          id: 'order-1',
          status: 'PENDING',
          expires_at: new Date('2024-01-01T00:00:00Z'),
          items: [{ product_id: 'prod-1', quantity: 1 }],
          payments: [
            {
              id: 'payment-1',
              stripe_payment_intent_id: 'pi_test_1',
              status: 'failed', // Statut final, ne doit pas être annulé
            },
          ],
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(mockExpiredOrders);
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrismaService);
      });
      mockReservationsService.releaseReservedStockForOrder.mockResolvedValue(1);
      mockPrismaService.paymentEvent.create.mockResolvedValue({});

      const result = await job.execute();

      expect(result.ordersExpired).toBe(1);
      expect(result.paymentIntentsCanceled).toBe(0); // Pas d'annulation car failed
      expect(result.stockReleased).toBe(1);
    });
  });
});
