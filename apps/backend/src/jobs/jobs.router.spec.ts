import { Test, TestingModule } from '@nestjs/testing';
import { JobsRouter } from './jobs.router';
import { JobsService } from './jobs.service';
import { MetricsService } from './metrics.service';

describe('JobsRouter', () => {
  let router: JobsRouter;
  let jobsService: JobsService;
  let metricsService: MetricsService;

  const mockJobsService = {
    getJobsStatus: jest.fn(),
    runExpireStaleOrdersManually: jest.fn(),
    runCleanupStalePaymentIntentsManually: jest.fn(),
  };

  const mockMetricsService = {
    getMetrics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsRouter,
        {
          provide: JobsService,
          useValue: mockJobsService,
        },
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    router = module.get<JobsRouter>(JobsRouter);
    jobsService = module.get<JobsService>(JobsService);
    metricsService = module.get<MetricsService>(MetricsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(router).toBeDefined();
  });

  describe('getJobsStatus', () => {
    it('should return jobs status from service', () => {
      const mockStatus = {
        expireStaleOrders: {
          name: 'expire-stale-orders',
          schedule: '*/5 * * * *',
          timezone: 'Europe/Paris',
          description: 'Expire les commandes non payées toutes les 5 minutes',
        },
        cleanupStalePaymentIntents: {
          name: 'cleanup-stale-payment-intents',
          schedule: '0 3 * * 0',
          timezone: 'Europe/Paris',
          description: 'Nettoie les PaymentIntents obsolètes tous les dimanches à 03:00',
        },
      };

      mockJobsService.getJobsStatus.mockReturnValue(mockStatus);

      const result = router.getJobsStatus();

      expect(result).toEqual(mockStatus);
      expect(jobsService.getJobsStatus).toHaveBeenCalledTimes(1);
    });
  });

  describe('getJobMetrics', () => {
    it('should return job metrics from service with ISO string date', () => {
      const mockMetrics = {
        paymentsExpiredTotal: 25,
        paymentIntentsCanceledTotal: 10,
        stockReleasedTotal: 150,
        jobExecutionTime: 5000,
        lastExecutionTime: new Date('2024-01-15T10:30:00.000Z'),
      };

      mockMetricsService.getMetrics.mockReturnValue(mockMetrics);

      const result = router.getJobMetrics();

      expect(result).toEqual({
        paymentsExpiredTotal: 25,
        paymentIntentsCanceledTotal: 10,
        stockReleasedTotal: 150,
        jobExecutionTime: 5000,
        lastExecutionTime: '2024-01-15T10:30:00.000Z',
      });
      expect(metricsService.getMetrics).toHaveBeenCalledTimes(1);
    });
  });

  describe('runExpireStaleOrdersManually', () => {
    it('should call service method and return result', async () => {
      const mockResult = {
        ordersExpired: 5,
        paymentIntentsCanceled: 2,
        stockReleased: 15,
        executionTime: 15000,
        errors: [],
      };

      mockJobsService.runExpireStaleOrdersManually.mockResolvedValue(mockResult);

      const result = await router.runExpireStaleOrdersManually();

      expect(result).toEqual(mockResult);
      expect(jobsService.runExpireStaleOrdersManually).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const mockError = new Error('Service error');
      mockJobsService.runExpireStaleOrdersManually.mockRejectedValue(mockError);

      await expect(router.runExpireStaleOrdersManually()).rejects.toThrow('Service error');
      expect(jobsService.runExpireStaleOrdersManually).toHaveBeenCalledTimes(1);
    });
  });

  describe('runCleanupStalePaymentIntentsManually', () => {
    it('should call service method and return result', async () => {
      const mockResult = {
        paymentIntentsCanceled: 3,
        paymentsUpdated: 8,
        executionTime: 8000,
        errors: [],
      };

      mockJobsService.runCleanupStalePaymentIntentsManually.mockResolvedValue(mockResult);

      const result = await router.runCleanupStalePaymentIntentsManually();

      expect(result).toEqual(mockResult);
      expect(jobsService.runCleanupStalePaymentIntentsManually).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const mockError = new Error('Cleanup service error');
      mockJobsService.runCleanupStalePaymentIntentsManually.mockRejectedValue(mockError);

      await expect(router.runCleanupStalePaymentIntentsManually()).rejects.toThrow('Cleanup service error');
      expect(jobsService.runCleanupStalePaymentIntentsManually).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration', () => {
    it('should handle complete workflow', async () => {
      // Setup mocks
      const mockStatus = {
        expireStaleOrders: { name: 'test', schedule: '*/5 * * * *', timezone: 'UTC', description: 'test' },
        cleanupStalePaymentIntents: { name: 'test', schedule: '0 3 * * 0', timezone: 'UTC', description: 'test' },
      };

      const mockMetrics = {
        paymentsExpiredTotal: 0,
        paymentIntentsCanceledTotal: 0,
        stockReleasedTotal: 0,
        jobExecutionTime: 0,
        lastExecutionTime: new Date(),
      };

      const mockJobResult = {
        ordersExpired: 2,
        paymentIntentsCanceled: 1,
        stockReleased: 10,
        executionTime: 5000,
        errors: [],
      };

      mockJobsService.getJobsStatus.mockReturnValue(mockStatus);
      mockMetricsService.getMetrics.mockReturnValue(mockMetrics);
      mockJobsService.runExpireStaleOrdersManually.mockResolvedValue(mockJobResult);

      // Test all methods
      const status = router.getJobsStatus();
      const metrics = router.getJobMetrics();
      const jobResult = await router.runExpireStaleOrdersManually();

      expect(status).toEqual(mockStatus);
      expect(metrics).toBeDefined();
      expect(jobResult).toEqual(mockJobResult);
    });
  });
});
