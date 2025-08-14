import { Input, Mutation, Query, Router } from 'nestjs-trpc';
import { RestocksService } from './restocks.service';
import { z } from 'zod';
import {
  createRestockSchema,
  restockToMaxSchema,
  restockWithItemsSchema,
} from './restocks.schema';
import type { CreateRestockInput, RestockToMaxInput } from './restocks.schema';

@Router({ alias: 'restocks' })
export class RestocksRouter {
  constructor(private readonly restocksService: RestocksService) {}

  @Query({
    output: z.array(restockWithItemsSchema),
  })
  getAllRestocks() {
    return this.restocksService.getAllRestocks();
  }

  @Query({
    input: z.object({ machine_id: z.string().min(1) }),
    output: z.array(restockWithItemsSchema),
  })
  getRestocksByMachine(@Input('machine_id') machineId: string) {
    return this.restocksService.getRestocksByMachine(machineId);
  }

  @Mutation({
    input: createRestockSchema,
    output: restockWithItemsSchema,
  })
  createRestock(@Input() restockData: CreateRestockInput) {
    return this.restocksService.createRestock(restockData);
  }

  @Mutation({
    input: restockToMaxSchema,
    output: restockWithItemsSchema,
  })
  restockToMax(@Input() restockData: RestockToMaxInput) {
    return this.restocksService.restockToMax(restockData);
  }
}
