import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { HealthResponseDto, ReadyResponseDto } from '../dto/health.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description:
      'Check the health status of the application and database connection',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check successful',
    type: HealthResponseDto,
  })
  async check() {
    try {
      // Test database connection
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness check',
    description: 'Comprehensive health check for application readiness',
  })
  @ApiResponse({
    status: 200,
    description: 'Readiness check successful',
    type: ReadyResponseDto,
  })
  async ready() {
    try {
      // More comprehensive health check
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        services: {
          database: 'ok',
          api: 'ok',
        },
      };
    } catch (error) {
      return {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        services: {
          database: 'error',
          api: 'ok',
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
