import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CardPaymentMetadataDto {
  @ApiProperty({
    description: 'Order ID for payment tracking',
    example: 'order_123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  order_id?: string;

  @ApiProperty({
    description: 'User ID for payment tracking',
    example: 'user_123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiProperty({
    description: 'Machine ID for payment tracking',
    example: 'machine_123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  machine_id?: string;
}

export class CardPaymentDto {
  @ApiProperty({
    description: 'Credit card number (13-19 digits)',
    example: '4242424242424242',
    minLength: 13,
    maxLength: 19,
    pattern: '^\\d{13,19}$',
  })
  @IsString()
  @Matches(/^\d{13,19}$/, { message: 'Card number must be 13-19 digits' })
  number: string;

  @ApiProperty({
    description: 'Card expiration month (1-12)',
    example: 12,
    minimum: 1,
    maximum: 12,
  })
  @IsNumber()
  @Min(1)
  @Max(12)
  exp_month: number;

  @ApiProperty({
    description: 'Card expiration year (4 digits)',
    example: 2025,
    minimum: 2024,
  })
  @IsNumber()
  @Min(2024)
  exp_year: number;

  @ApiProperty({
    description: 'Card verification code (3-4 digits)',
    example: '123',
    minLength: 3,
    maxLength: 4,
    pattern: '^\\d{3,4}$',
  })
  @IsString()
  @Matches(/^\d{3,4}$/, { message: 'CVC must be 3-4 digits' })
  cvc: string;

  @ApiProperty({
    description: 'Country code (ISO 3166-1 alpha-2 or alpha-3)',
    example: 'FR',
    minLength: 2,
    maxLength: 3,
    pattern: '^[A-Z]{2,3}$',
  })
  @IsString()
  @Matches(/^[A-Z]{2,3}$/, {
    message: 'Country code must be 2-3 uppercase letters',
  })
  country: string;

  @ApiProperty({
    description: 'Payment amount in cents (minimum 1 cent)',
    example: 2000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'eur',
    default: 'eur',
    maxLength: 3,
    pattern: '^[A-Z]{3}$',
  })
  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'Currency must be 3 uppercase letters' })
  currency: string;

  @ApiProperty({
    description: 'Additional metadata for payment tracking',
    type: CardPaymentMetadataDto,
    required: false,
    example: {
      order_id: 'order_123456789',
      user_id: 'user_123456789',
      machine_id: 'machine_123456789',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CardPaymentMetadataDto)
  metadata?: CardPaymentMetadataDto;
}

export class PaymentSuccessResponseDto {
  @ApiProperty({
    description: 'Payment status',
    example: 'PAYMENT_SUCCESSFUL',
    enum: ['PAYMENT_SUCCESSFUL', 'PAYMENT_REQUIRES_ACTION', 'PAYMENT_DECLINED'],
  })
  status: string;

  @ApiProperty({
    description: 'Stripe payment intent ID',
    example: 'pi_1234567890abcdef',
  })
  payment_intent_id: string;

  @ApiProperty({
    description: 'Payment amount in cents',
    example: 2000,
  })
  amount: number;

  @ApiProperty({
    description: 'Payment currency',
    example: 'eur',
  })
  currency: string;

  @ApiProperty({
    description: 'Payment creation timestamp',
    example: 1642234567,
  })
  created: number;

  @ApiProperty({
    description: 'Payment metadata',
    type: 'object',
    additionalProperties: true,
  })
  metadata: Record<string, any>;
}

export class PaymentRequiresActionResponseDto {
  @ApiProperty({
    description: 'Payment status',
    example: 'PAYMENT_REQUIRES_ACTION',
  })
  status: string;

  @ApiProperty({
    description: 'Stripe payment intent ID',
    example: 'pi_1234567890abcdef',
  })
  payment_intent_id: string;

  @ApiProperty({
    description: 'Client secret for 3D Secure authentication',
    example: 'pi_1234567890abcdef_secret_abc123def456',
  })
  client_secret: string;

  @ApiProperty({
    description: 'Next action required for payment',
    type: 'object',
    additionalProperties: true,
  })
  next_action: any;
}

export class PaymentDeclinedResponseDto {
  @ApiProperty({
    description: 'Payment status',
    example: 'PAYMENT_DECLINED',
  })
  status: string;

  @ApiProperty({
    description: 'Stripe payment intent ID',
    example: 'pi_1234567890abcdef',
  })
  payment_intent_id: string;

  @ApiProperty({
    description: 'Reason for payment failure',
    example: 'Your card was declined.',
  })
  failure_reason: string;

  @ApiProperty({
    description: 'Stripe error code',
    example: 'card_declined',
    required: false,
  })
  error_code?: string;

  @ApiProperty({
    description: 'Stripe error message',
    example: 'Your card was declined.',
    required: false,
  })
  error_message?: string;

  @ApiProperty({
    description: 'Stripe decline code',
    example: 'insufficient_funds',
    required: false,
  })
  decline_code?: string;
}

export class ValidationErrorResponseDto {
  @ApiProperty({
    description: 'Error status',
    example: 'VALIDATION_ERROR',
  })
  status: string;

  @ApiProperty({
    description: 'Validation errors',
    type: 'array',
  })
  errors: any[];
}
