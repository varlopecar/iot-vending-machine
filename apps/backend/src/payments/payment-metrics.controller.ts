import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentMetricsService } from './payment-metrics.service';
import {
  MetricsSummaryDto,
  DetailedMetricsDto,
  DailyMetricsDto,
  MetricsHealthDto,
  PrometheusMetricsDto,
} from '../dto/metrics.dto';

@ApiTags('metrics')
@Controller('metrics/payments')
export class PaymentMetricsController {
  constructor(private readonly metricsService: PaymentMetricsService) {}

  /**
   * GET /metrics/payments
   * Récupère un résumé des métriques de paiement
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get payment metrics summary',
    description: 'Get a summary of payment metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment metrics summary retrieved successfully',
    type: MetricsSummaryDto,
  })
  getMetricsSummary() {
    return this.metricsService.getMetricsSummary();
  }

  /**
   * GET /metrics/payments/detailed
   * Récupère les métriques détaillées
   */
  @Get('detailed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get detailed payment metrics',
    description: 'Get detailed payment metrics information',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed payment metrics retrieved successfully',
    type: DetailedMetricsDto,
  })
  getDetailedMetrics() {
    return this.metricsService.getMetrics();
  }

  /**
   * GET /metrics/payments/daily
   * Récupère les métriques des dernières 24h
   */
  @Get('daily')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get daily payment metrics',
    description: 'Get payment metrics for the last 24 hours',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily payment metrics retrieved successfully',
    type: DailyMetricsDto,
  })
  getDailyMetrics() {
    return this.metricsService.getDailyMetrics();
  }

  /**
   * GET /metrics/payments/prometheus
   * Récupère les métriques au format Prometheus
   */
  @Get('prometheus')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Prometheus metrics',
    description: 'Get payment metrics in Prometheus format',
  })
  @ApiResponse({
    status: 200,
    description: 'Prometheus metrics retrieved successfully',
    type: PrometheusMetricsDto,
  })
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
  @ApiOperation({
    summary: 'Get metrics health',
    description: 'Get health status of payment metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Metrics health retrieved successfully',
    type: MetricsHealthDto,
  })
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
