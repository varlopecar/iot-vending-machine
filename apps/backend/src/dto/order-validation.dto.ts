import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class QRCodeDataDto {
  @ApiProperty({
    description: 'Order ID from QR code',
    example: 'order_123456789',
    minLength: 1,
  })
  @IsString()
  orderID: string;

  @ApiProperty({
    description: 'Machine ID for verification',
    example: 'machine_123456789',
    required: false,
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  machineID?: string;

  @ApiProperty({
    description: 'User ID for verification',
    example: 'user_123456789',
    required: false,
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  userID?: string;

  @ApiProperty({
    description: 'QR code timestamp in ISO 8601 format',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
    pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$',
  })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiProperty({
    description: 'QR code signature for security verification',
    example: 'abc123def456',
    required: false,
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  signature?: string;
}

export class QRTokenDto {
  @ApiProperty({
    description: 'QR code token for validation',
    example: 'qr_token_123456789',
  })
  @IsString()
  qr_code_token: string;
}

export class OrderValidationResponseDto {
  @ApiProperty({
    description: 'Validation status',
    example: 'VALID_ORDER',
    enum: ['VALID_ORDER', 'INVALID_ORDER', 'VALIDATION_ERROR'],
  })
  status: string;

  @ApiProperty({
    description: 'Response message',
    example: 'Commande valide et prête pour le retrait',
  })
  message: string;

  @ApiProperty({
    description: 'Order ID',
    example: 'order_123456789',
  })
  order_id: string;

  @ApiProperty({
    description: 'User ID',
    example: 'user_123456789',
    required: false,
  })
  user_id?: string;

  @ApiProperty({
    description: 'Machine ID',
    example: 'machine_123456789',
    required: false,
  })
  machine_id?: string;

  @ApiProperty({
    description: 'Order items',
    type: 'array',
    required: false,
  })
  items?: any[];

  @ApiProperty({
    description: 'Order expiration timestamp',
    example: '2024-01-15T11:00:00.000Z',
    required: false,
  })
  expires_at?: string;

  @ApiProperty({
    description: 'Order creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  created_at?: string;

  @ApiProperty({
    description: 'Current order status',
    example: 'active',
    required: false,
  })
  current_status?: string;

  @ApiProperty({
    description: 'Expiration timestamp',
    example: '2024-01-15T11:00:00.000Z',
    required: false,
  })
  expired_at?: string;

  @ApiProperty({
    description: 'Expected machine ID',
    example: 'machine_123456789',
    required: false,
  })
  expected_machine?: string;

  @ApiProperty({
    description: 'Provided machine ID',
    example: 'machine_123456789',
    required: false,
  })
  provided_machine?: string;
}

export class OrderStatusResponseDto {
  @ApiProperty({
    description: 'Order ID',
    example: 'order_123456789',
  })
  order_id: string;

  @ApiProperty({
    description: 'Order status',
    example: 'active',
    enum: ['active', 'used', 'expired', 'cancelled'],
  })
  status: string;

  @ApiProperty({
    description: 'User ID',
    example: 'user_123456789',
  })
  user_id: string;

  @ApiProperty({
    description: 'Machine ID',
    example: 'machine_123456789',
  })
  machine_id: string;

  @ApiProperty({
    description: 'Order creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  created_at: string;

  @ApiProperty({
    description: 'Order expiration timestamp',
    example: '2024-01-15T11:00:00.000Z',
  })
  expires_at: string;

  @ApiProperty({
    description: 'Order items',
    type: 'array',
  })
  items: any[];

  @ApiProperty({
    description: 'Whether the order has expired',
    example: false,
  })
  is_expired: boolean;
}
