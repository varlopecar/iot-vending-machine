import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorDto {
  @ApiProperty({
    description: 'Error status',
    example: 'VALIDATION_ERROR',
  })
  status: string;

  @ApiProperty({
    description: 'Human-readable error message',
    example: 'Validation failed',
  })
  message: string;

  @ApiProperty({
    description: 'Validation errors',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        field: { type: 'string', example: 'order_id' },
        message: { type: 'string', example: 'Order ID is required' },
        value: { type: 'string', example: '' },
      },
    },
  })
  errors: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

export class NotFoundErrorDto {
  @ApiProperty({
    description: 'Error status',
    example: 'NOT_FOUND',
  })
  status: string;

  @ApiProperty({
    description: 'Human-readable error message',
    example: 'Resource not found',
  })
  message: string;

  @ApiProperty({
    description: 'Resource that was not found',
    example: 'order_123456789',
  })
  resource?: string;
}

export class BadRequestErrorDto {
  @ApiProperty({
    description: 'Error status',
    example: 'BAD_REQUEST',
  })
  status: string;

  @ApiProperty({
    description: 'Human-readable error message',
    example: 'Invalid request data',
  })
  message: string;

  @ApiProperty({
    description: 'Technical error details',
    example: 'Invalid JSON format',
    required: false,
  })
  error?: string;
}

export class InternalServerErrorDto {
  @ApiProperty({
    description: 'Error status',
    example: 'INTERNAL_SERVER_ERROR',
  })
  status: string;

  @ApiProperty({
    description: 'Human-readable error message',
    example: 'An internal server error occurred',
  })
  message: string;

  @ApiProperty({
    description: 'Error timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;
}
