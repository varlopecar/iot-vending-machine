import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DeliveredItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: 'prod_123456789',
  })
  @IsString()
  product_id: string;

  @ApiProperty({
    description: 'Slot number in the vending machine',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  slot_number: number;

  @ApiProperty({
    description: 'Quantity delivered',
    example: 2,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ConfirmDeliveryDto {
  @ApiProperty({
    description: 'Order ID to confirm delivery',
    example: 'order_123456789',
    minLength: 1,
  })
  @IsString()
  order_id: string;

  @ApiProperty({
    description: 'Machine ID for cross-verification',
    example: 'machine_123456789',
    required: false,
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  machine_id?: string;

  @ApiProperty({
    description: 'Delivery timestamp in ISO 8601 format',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
    pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$',
  })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiProperty({
    description: 'Items delivered for verification',
    type: [DeliveredItemDto],
    required: false,
    example: [
      {
        product_id: 'prod_123456789',
        slot_number: 1,
        quantity: 2,
      },
      {
        product_id: 'prod_987654321',
        slot_number: 3,
        quantity: 1,
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveredItemDto)
  items_delivered?: DeliveredItemDto[];
}

export class DeliveryResponseDto {
  @ApiProperty({
    description: 'Delivery status',
    example: 'DELIVERY_CONFIRMED',
    enum: ['DELIVERY_CONFIRMED', 'DELIVERY_ERROR'],
  })
  status: string;

  @ApiProperty({
    description: 'Response message',
    example: 'Commande livrée avec succès',
  })
  message: string;

  @ApiProperty({
    description: 'Order ID',
    example: 'order_123456789',
  })
  order_id: string;

  @ApiProperty({
    description: 'Delivery timestamp',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  delivered_at?: string;

  @ApiProperty({
    description: 'Original order status',
    example: 'active',
    required: false,
  })
  original_status?: string;

  @ApiProperty({
    description: 'New order status',
    example: 'used',
    required: false,
  })
  new_status?: string;

  @ApiProperty({
    description: 'Order items',
    type: 'array',
    required: false,
  })
  items?: any[];
}

export class DeleteOrderResponseDto {
  @ApiProperty({
    description: 'Delete operation status',
    example: 'ORDER_DELETED',
    enum: ['ORDER_DELETED', 'DELETE_ERROR'],
  })
  status: string;

  @ApiProperty({
    description: 'Response message',
    example: 'Commande supprimée avec succès',
  })
  message: string;

  @ApiProperty({
    description: 'Order ID',
    example: 'order_123456789',
  })
  order_id: string;

  @ApiProperty({
    description: 'Archive timestamp',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  archived_at?: string;

  @ApiProperty({
    description: 'Previous order status',
    example: 'used',
    required: false,
  })
  previous_status?: string;
}

export class CancelOrderResponseDto {
  @ApiProperty({
    description: 'Cancel operation status',
    example: 'ORDER_CANCELLED',
    enum: ['ORDER_CANCELLED', 'CANCEL_ERROR'],
  })
  status: string;

  @ApiProperty({
    description: 'Response message',
    example: 'Commande annulée avec succès',
  })
  message: string;

  @ApiProperty({
    description: 'Order ID',
    example: 'order_123456789',
  })
  order_id: string;

  @ApiProperty({
    description: 'Cancellation timestamp',
    example: '2024-01-15T10:30:00.000Z',
  })
  cancelled_at: string;

  @ApiProperty({
    description: 'Order status after cancellation',
    example: 'cancelled',
  })
  order_status: string;
}
