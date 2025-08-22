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
  @ApiResponse({
    status: 200,
    description: 'Stock quantity updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        machine_id: { type: 'string' },
        product_id: { type: 'string' },
        quantity: { type: 'number' },
        slot_number: { type: 'number' },
        max_capacity: { type: 'number' },
        low_threshold: { type: 'number' },
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
