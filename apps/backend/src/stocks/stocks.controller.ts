import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StocksService } from './stocks.service';
import { z } from 'zod';

const updateStockQuantitySchema = z.object({
  stockId: z.string().min(1),
  quantity: z.number().int().min(0),
});

@ApiTags('stocks')
@Controller('api/stocks')
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Post('update-quantity')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update stock quantity',
    description:
      'Update the quantity of a specific stock item (for IoT machines)',
  })
  @ApiBody({
    description: 'Stock quantity update data',
    schema: {
      type: 'object',
      required: ['stockId', 'quantity'],
      properties: {
        stockId: {
          type: 'string',
          description: 'ID of the stock item to update',
          example: 'stock_123456789',
        },
        quantity: {
          type: 'number',
          description: 'New quantity for the stock item',
          minimum: 0,
          example: 15,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Stock quantity updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'stock_123456789' },
        machine_id: { type: 'string', example: 'machine_123456789' },
        product_id: { type: 'string', example: 'product_123456789' },
        quantity: { type: 'number', example: 15 },
        slot_number: { type: 'number', example: 1 },
        max_capacity: { type: 'number', example: 20 },
        low_threshold: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 404,
    description: 'Stock not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid quantity or exceeds capacity',
  })
  async updateStockQuantity(@Body() body: any) {
    const { stockId, quantity } = updateStockQuantitySchema.parse(body);

    return this.stocksService.updateStock(stockId, { quantity });
  }
}
