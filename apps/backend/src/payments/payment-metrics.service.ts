import { Injectable } from '@nestjs/common';
import { PaymentMonitoringMiddleware } from './payment-monitoring.middleware';

@Injectable()
export class PaymentMetricsService {
  constructor(private readonly monitoringMiddleware: PaymentMonitoringMiddleware) {}

  /**
   * Récupère les métriques de paiement au format JSON
   */
  getMetrics() {
    const metrics = this.monitoringMiddleware.getMetrics();
    
    return {
      ...metrics,
      successRate: this.calculateSuccessRate(metrics),
      totalPayments: metrics.paymentSuccessTotal + metrics.paymentFailureTotal,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Récupère les métriques au format Prometheus
   */
  getPrometheusMetrics(): string {
    return this.monitoringMiddleware.getPrometheusMetrics();
  }

  /**
   * Récupère un résumé des métriques pour le dashboard
   */
  getMetricsSummary() {
    const metrics = this.monitoringMiddleware.getMetrics();
    const totalPayments = metrics.paymentSuccessTotal + metrics.paymentFailureTotal;
    
    return {
      totalPayments,
      successCount: metrics.paymentSuccessTotal,
      failureCount: metrics.paymentFailureTotal,
      successRate: this.calculateSuccessRate(metrics),
      averageResponseTime: metrics.averagePaymentTime.toFixed(3) + 's',
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Récupère les métriques des dernières 24h (simulation)
   */
  getDailyMetrics() {
    const metrics = this.monitoringMiddleware.getMetrics();
    
    // Simuler des données horaires basées sur les métriques actuelles
    const now = new Date();
    const hourlyData = [];
    
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourMetrics = {
        hour: hour.toISOString().slice(0, 13) + ':00:00.000Z',
        successCount: Math.floor(metrics.paymentSuccessTotal / 24) + Math.floor(Math.random() * 5),
        failureCount: Math.floor(metrics.paymentFailureTotal / 24) + Math.floor(Math.random() * 2),
        averageResponseTime: (metrics.averagePaymentTime + Math.random() * 0.5).toFixed(3),
      };
      
      hourlyData.push(hourMetrics);
    }
    
    return {
      period: '24h',
      data: hourlyData,
      summary: {
        totalSuccess: hourlyData.reduce((sum, h) => sum + h.successCount, 0),
        totalFailure: hourlyData.reduce((sum, h) => sum + h.failureCount, 0),
        averageResponseTime: (hourlyData.reduce((sum, h) => sum + parseFloat(h.averageResponseTime), 0) / 24).toFixed(3),
      },
    };
  }

  /**
   * Réinitialise les métriques
   */
  resetMetrics(): void {
    this.monitoringMiddleware.resetMetrics();
  }

  /**
   * Calcule le taux de succès en pourcentage
   */
  private calculateSuccessRate(metrics: any): string {
    const total = metrics.paymentSuccessTotal + metrics.paymentFailureTotal;
    if (total === 0) return '0.00%';
    
    const rate = (metrics.paymentSuccessTotal / total) * 100;
    return rate.toFixed(2) + '%';
  }
}
