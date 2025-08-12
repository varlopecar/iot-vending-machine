import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsService],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  afterEach(() => {
    service.resetMetrics();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('incrementExpiredOrders', () => {
    it('should increment expired orders count', () => {
      service.incrementExpiredOrders(5);
      const metrics = service.getMetrics();
      expect(metrics.paymentsExpiredTotal).toBe(5);
    });

    it('should increment by 1 when no count provided', () => {
      service.incrementExpiredOrders();
      const metrics = service.getMetrics();
      expect(metrics.paymentsExpiredTotal).toBe(1);
    });

    it('should accumulate multiple increments', () => {
      service.incrementExpiredOrders(3);
      service.incrementExpiredOrders(2);
      const metrics = service.getMetrics();
      expect(metrics.paymentsExpiredTotal).toBe(5);
    });
  });

  describe('incrementCanceledPaymentIntents', () => {
    it('should increment canceled payment intents count', () => {
      service.incrementCanceledPaymentIntents(10);
      const metrics = service.getMetrics();
      expect(metrics.paymentIntentsCanceledTotal).toBe(10);
    });

    it('should increment by 1 when no count provided', () => {
      service.incrementCanceledPaymentIntents();
      const metrics = service.getMetrics();
      expect(metrics.paymentIntentsCanceledTotal).toBe(1);
    });
  });

  describe('incrementReleasedStock', () => {
    it('should increment released stock count', () => {
      service.incrementReleasedStock(25);
      const metrics = service.getMetrics();
      expect(metrics.stockReleasedTotal).toBe(25);
    });

    it('should increment by 1 when no count provided', () => {
      service.incrementReleasedStock();
      const metrics = service.getMetrics();
      expect(metrics.stockReleasedTotal).toBe(1);
    });
  });

  describe('updateJobExecutionTime', () => {
    it('should update job execution time and last execution time', () => {
      const executionTime = 15000; // 15 seconds
      service.updateJobExecutionTime(executionTime);
      
      const metrics = service.getMetrics();
      expect(metrics.jobExecutionTime).toBe(executionTime);
      expect(metrics.lastExecutionTime).toBeInstanceOf(Date);
    });
  });

  describe('getMetrics', () => {
    it('should return a copy of metrics, not the original', () => {
      service.incrementExpiredOrders(5);
      const metrics1 = service.getMetrics();
      const metrics2 = service.getMetrics();
      
      expect(metrics1).toEqual(metrics2);
      expect(metrics1).not.toBe(metrics2); // Different references
    });

    it('should return initial metrics when no operations performed', () => {
      const metrics = service.getMetrics();
      expect(metrics.paymentsExpiredTotal).toBe(0);
      expect(metrics.paymentIntentsCanceledTotal).toBe(0);
      expect(metrics.stockReleasedTotal).toBe(0);
      expect(metrics.jobExecutionTime).toBe(0);
      expect(metrics.lastExecutionTime).toBeInstanceOf(Date);
    });
  });

  describe('resetMetrics', () => {
    it('should reset all metrics to initial values', () => {
      // Set some values
      service.incrementExpiredOrders(10);
      service.incrementCanceledPaymentIntents(5);
      service.incrementReleasedStock(20);
      service.updateJobExecutionTime(30000);

      // Reset
      service.resetMetrics();

      // Verify reset
      const metrics = service.getMetrics();
      expect(metrics.paymentsExpiredTotal).toBe(0);
      expect(metrics.paymentIntentsCanceledTotal).toBe(0);
      expect(metrics.stockReleasedTotal).toBe(0);
      expect(metrics.jobExecutionTime).toBe(0);
    });

    it('should create new lastExecutionTime on reset', async () => {
      const originalTime = service.getMetrics().lastExecutionTime;
      
      // Wait a bit longer to ensure time difference
      await new Promise(resolve => setTimeout(resolve, 100));
      
      service.resetMetrics();
      const newTime = service.getMetrics().lastExecutionTime;
      
      expect(newTime).not.toEqual(originalTime);
    });
  });

  describe('integration', () => {
    it('should track complete job execution', () => {
      const startTime = Date.now();
      
      // Simulate job execution
      service.incrementExpiredOrders(3);
      service.incrementCanceledPaymentIntents(2);
      service.incrementReleasedStock(15);
      
      const executionTime = Date.now() - startTime;
      service.updateJobExecutionTime(executionTime);

      const metrics = service.getMetrics();
      expect(metrics.paymentsExpiredTotal).toBe(3);
      expect(metrics.paymentIntentsCanceledTotal).toBe(2);
      expect(metrics.stockReleasedTotal).toBe(15);
      expect(metrics.jobExecutionTime).toBe(executionTime);
      expect(metrics.lastExecutionTime).toBeInstanceOf(Date);
    });
  });
});
