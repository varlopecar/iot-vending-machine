import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentMetricsService } from './payment-metrics.service';

@Controller('metrics/payments')
export class PaymentMetricsController {
  constructor(private readonly metricsService: PaymentMetricsService) {}

  /**
   * GET /metrics/payments
   * Récupère un résumé des métriques de paiement
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  getMetricsSummary() {
    return this.metricsService.getMetricsSummary();
  }

  /**
   * GET /metrics/payments/detailed
   * Récupère les métriques détaillées
   */
  @Get('detailed')
  @HttpCode(HttpStatus.OK)
  getDetailedMetrics() {
    return this.metricsService.getMetrics();
  }

  /**
   * GET /metrics/payments/daily
   * Récupère les métriques des dernières 24h
   */
  @Get('daily')
  @HttpCode(HttpStatus.OK)
  getDailyMetrics() {
    return this.metricsService.getDailyMetrics();
  }

  /**
   * GET /metrics/payments/prometheus
   * Récupère les métriques au format Prometheus
   */
  @Get('prometheus')
  @HttpCode(HttpStatus.OK)
  getPrometheusMetrics() {
    const metrics = this.metricsService.getPrometheusMetrics();
    return {
      contentType: 'text/plain; version=0.0.4; charset=utf-8',
      data: metrics,
    };
  }

  /**
   * GET /metrics/payments/health
   * Endpoint de santé pour les métriques
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  getHealth() {
    const metrics = this.metricsService.getMetrics();
    const totalPayments =
      metrics.paymentSuccessTotal + metrics.paymentFailureTotal;

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics: {
        totalPayments,
        successRate: this.calculateSuccessRate(metrics),
        averageResponseTime: metrics.averagePaymentTime.toFixed(3) + 's',
      },
    };
  }

  private calculateSuccessRate(metrics: any): string {
    const total = metrics.paymentSuccessTotal + metrics.paymentFailureTotal;
    if (total === 0) return '0.00%';

    const rate = (metrics.paymentSuccessTotal / total) * 100;
    return rate.toFixed(2) + '%';
  }
}
