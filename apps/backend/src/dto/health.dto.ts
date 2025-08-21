import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    description: 'Health status of the application',
    example: 'ok',
    enum: ['ok', 'error'],
  })
  status: string;

  @ApiProperty({
    description: 'Current timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Application uptime in seconds',
    example: 3600,
  })
  uptime: number;

  @ApiProperty({
    description: 'Current environment',
    example: 'development',
  })
  environment: string;

  @ApiProperty({
    description: 'Database connection status',
    example: 'connected',
    enum: ['connected', 'disconnected'],
  })
  database: string;

  @ApiProperty({
    description: 'Error message if status is error',
    example: 'Database connection failed',
    required: false,
  })
  error?: string;
}

export class ReadyResponseDto {
  @ApiProperty({
    description: 'Readiness status of the application',
    example: 'ready',
    enum: ['ready', 'not_ready'],
  })
  status: string;

  @ApiProperty({
    description: 'Current timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Status of individual services',
    example: {
      database: 'ok',
      api: 'ok',
    },
  })
  services: {
    database: string;
    api: string;
  };

  @ApiProperty({
    description: 'Error message if status is not_ready',
    example: 'Database connection failed',
    required: false,
  })
  error?: string;
}
