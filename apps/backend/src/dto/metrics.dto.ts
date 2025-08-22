import { ApiProperty } from '@nestjs/swagger';

export class MetricsSummaryDto {
  @ApiProperty({
    description: 'Total number of successful payments',
    example: 150,
  })
  paymentSuccessTotal: number;

  @ApiProperty({
    description: 'Total number of failed payments',
    example: 5,
  })
  paymentFailureTotal: number;

  @ApiProperty({
    description: 'Average payment processing time in seconds',
    example: 2.5,
  })
  averagePaymentTime: number;

  @ApiProperty({
    description: 'Success rate percentage',
    example: '96.77%',
  })
  successRate: string;
}

export class DetailedMetricsDto {
  @ApiProperty({
    description: 'Total number of successful payments',
    example: 150,
  })
  paymentSuccessTotal: number;

  @ApiProperty({
    description: 'Total number of failed payments',
    example: 5,
  })
  paymentFailureTotal: number;

  @ApiProperty({
    description: 'Average payment processing time in seconds',
    example: 2.5,
  })
  averagePaymentTime: number;

  @ApiProperty({
    description: 'Total payment amount in cents',
    example: 1500000,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Payment currency',
    example: 'eur',
  })
  currency: string;

  @ApiProperty({
    description: 'Last payment timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  lastPaymentAt: string;
}

export class DailyMetricsDto {
  @ApiProperty({
    description: 'Date of the metrics',
    example: '2024-01-15',
  })
  date: string;

  @ApiProperty({
    description: 'Number of successful payments for the day',
    example: 25,
  })
  successfulPayments: number;

  @ApiProperty({
    description: 'Number of failed payments for the day',
    example: 1,
  })
  failedPayments: number;

  @ApiProperty({
    description: 'Total amount for the day in cents',
    example: 250000,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Average payment time for the day in seconds',
    example: 2.3,
  })
  averagePaymentTime: number;
}

export class MetricsHealthDto {
  @ApiProperty({
    description: 'Health status',
    example: 'healthy',
  })
  status: string;

  @ApiProperty({
    description: 'Current timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Metrics summary',
    type: MetricsSummaryDto,
  })
  metrics: MetricsSummaryDto;
}

export class PrometheusMetricsDto {
  @ApiProperty({
    description: 'Content type for Prometheus format',
    example: 'text/plain; version=0.0.4; charset=utf-8',
  })
  contentType: string;

  @ApiProperty({
    description: 'Prometheus metrics data',
    example:
      '# HELP payment_success_total Total successful payments\n# TYPE payment_success_total counter\npayment_success_total 150',
  })
  data: string;
}
