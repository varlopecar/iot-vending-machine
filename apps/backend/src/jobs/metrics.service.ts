import { Injectable } from '@nestjs/common';

export interface JobMetrics {
  paymentsExpiredTotal: number;
  paymentIntentsCanceledTotal: number;
  stockReleasedTotal: number;
  jobExecutionTime: number;
  lastExecutionTime: Date;
}

@Injectable()
export class MetricsService {
  private metrics: JobMetrics = {
    paymentsExpiredTotal: 0,
    paymentIntentsCanceledTotal: 0,
    stockReleasedTotal: 0,
    jobExecutionTime: 0,
    lastExecutionTime: new Date(),
  };

  /**
   * Incrémente le compteur des commandes expirées
   */
  incrementExpiredOrders(count: number = 1) {
    this.metrics.paymentsExpiredTotal += count;
  }

  /**
   * Incrémente le compteur des PaymentIntents annulés
   */
  incrementCanceledPaymentIntents(count: number = 1) {
    this.metrics.paymentIntentsCanceledTotal += count;
  }

  /**
   * Incrémente le compteur du stock libéré
   */
  incrementReleasedStock(count: number = 1) {
    this.metrics.stockReleasedTotal += count;
  }

  /**
   * Met à jour le temps d'exécution du job
   */
  updateJobExecutionTime(executionTime: number) {
    this.metrics.jobExecutionTime = executionTime;
    this.metrics.lastExecutionTime = new Date();
  }

  /**
   * Récupère les métriques actuelles
   */
  getMetrics(): JobMetrics {
    return { ...this.metrics };
  }

  /**
   * Réinitialise les métriques (utile pour les tests)
   */
  resetMetrics() {
    this.metrics = {
      paymentsExpiredTotal: 0,
      paymentIntentsCanceledTotal: 0,
      stockReleasedTotal: 0,
      jobExecutionTime: 0,
      lastExecutionTime: new Date(),
    };
  }
}
