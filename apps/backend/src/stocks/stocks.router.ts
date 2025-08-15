import { Input, Mutation, Query, Router } from 'nestjs-trpc';
import { StocksService } from './stocks.service';
import { z } from 'zod';
import {
  createStockSchema,
  updateStockSchema,
  addSlotSchema,
  stockSchema,
  stockWithProductSchema,
} from './stocks.schema';
import type { CreateStockInput, UpdateStockInput, AddSlotInput } from './stocks.schema';

@Router({ alias: 'stocks' })
export class StocksRouter {
  constructor(private readonly stocksService: StocksService) {}

  @Query({
    output: z.array(stockSchema),
  })
  getAllStocks() {
    return this.stocksService.getAllStocks();
  }

  @Query({
    input: z.object({ id: z.string().min(1) }),
    output: stockSchema,
  })
  getStockById(@Input('id') id: string) {
    return this.stocksService.getStockById(id);
  }

  @Query({
    input: z.object({ machine_id: z.string().min(1) }),
    output: z.array(stockWithProductSchema),
  })
  getStocksByMachine(@Input('machine_id') machineId: string) {
    return this.stocksService.getStocksByMachine(machineId);
  }

  @Query({
    input: z.object({
      machine_id: z.string().min(1),
      product_id: z.string().min(1),
    }),
    output: stockSchema.nullable(),
  })
  getStockByMachineAndProduct(
    @Input('machine_id') machineId: string,
    @Input('product_id') productId: string,
  ) {
    return this.stocksService.getStockByMachineAndProduct(machineId, productId);
  }

  @Query({
    input: z.object({ threshold: z.number().int().positive().optional() }),
    output: z.array(stockWithProductSchema),
  })
  getLowStockItems(@Input('threshold') threshold?: number) {
    return this.stocksService.getLowStockItems(threshold);
  }

  @Query({
    output: z.array(stockWithProductSchema),
  })
  getOutOfStockItems() {
    return this.stocksService.getOutOfStockItems();
  }

  @Mutation({
    input: createStockSchema,
    output: stockSchema,
  })
  createStock(@Input() stockData: CreateStockInput) {
    return this.stocksService.createStock(stockData);
  }

  @Mutation({
    input: z.object({
      id: z.string().min(1),
      data: updateStockSchema,
    }),
    output: stockSchema,
  })
  updateStock(@Input('id') id: string, @Input('data') data: UpdateStockInput) {
    return this.stocksService.updateStock(id, data);
  }

  @Mutation({
    input: z.object({
      id: z.string().min(1),
      quantity: z.number().int().min(0),
    }),
    output: stockSchema,
  })
  updateStockQuantity(
    @Input('id') id: string,
    @Input('quantity') quantity: number,
  ) {
    return this.stocksService.updateStockQuantity(id, quantity);
  }

  @Mutation({
    input: z.object({
      id: z.string().min(1),
      quantity: z.number().int().positive(),
    }),
    output: stockSchema,
  })
  addStockQuantity(
    @Input('id') id: string,
    @Input('quantity') quantity: number,
  ) {
    return this.stocksService.addStockQuantity(id, quantity);
  }

  @Mutation({
    input: z.object({
      id: z.string().min(1),
      quantity: z.number().int().positive(),
    }),
    output: stockSchema,
  })
  removeStockQuantity(
    @Input('id') id: string,
    @Input('quantity') quantity: number,
  ) {
    return this.stocksService.removeStockQuantity(id, quantity);
  }

  @Query({
    input: z.object({ machine_id: z.string().min(1) }),
    output: z.number().int().positive(),
  })
  getNextAvailableSlotNumber(@Input('machine_id') machineId: string) {
    return this.stocksService.getNextAvailableSlotNumber(machineId);
  }

  @Mutation({
    input: addSlotSchema,
    output: stockSchema,
  })
  addSlot(@Input() slotData: AddSlotInput) {
    return this.stocksService.addSlot(slotData);
  }
}
