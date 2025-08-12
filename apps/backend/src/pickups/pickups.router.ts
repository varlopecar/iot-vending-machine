import { Input, Mutation, Query, Router } from 'nestjs-trpc';
import { PickupsService } from './pickups.service';
import { z } from 'zod';
import {
  createPickupSchema,
  updatePickupSchema,
  pickupSchema,
} from './pickups.schema';
import type { CreatePickupInput, UpdatePickupInput } from './pickups.schema';

@Router({ alias: 'pickups' })
export class PickupsRouter {
  constructor(private readonly pickupsService: PickupsService) {}

  @Query({
    input: z.object({ id: z.string().min(1) }),
    output: pickupSchema,
  })
  getPickupById(@Input('id') id: string) {
    return this.pickupsService.getPickupById(id);
  }

  @Query({
    input: z.object({ order_id: z.string().min(1) }),
    output: z.array(pickupSchema),
  })
  getPickupsByOrderId(@Input('order_id') orderId: string) {
    return this.pickupsService.getPickupsByOrderId(orderId);
  }

  @Query({
    input: z.object({ machine_id: z.string().min(1) }),
    output: z.array(pickupSchema),
  })
  getPickupsByMachineId(@Input('machine_id') machineId: string) {
    return this.pickupsService.getPickupsByMachineId(machineId);
  }

  @Query({
    output: z.array(pickupSchema),
  })
  getPendingPickups() {
    return this.pickupsService.getPendingPickups();
  }

  @Query({
    output: z.array(pickupSchema),
  })
  getCompletedPickups() {
    return this.pickupsService.getCompletedPickups();
  }

  @Mutation({
    input: createPickupSchema,
    output: pickupSchema,
  })
  createPickup(@Input() pickupData: CreatePickupInput) {
    return this.pickupsService.createPickup(pickupData);
  }

  @Mutation({
    input: z.object({
      id: z.string().min(1),
      data: updatePickupSchema,
    }),
    output: pickupSchema,
  })
  updatePickup(
    @Input('id') id: string,
    @Input('data') data: UpdatePickupInput,
  ) {
    return this.pickupsService.updatePickup(id, data);
  }

  @Mutation({
    input: z.object({ id: z.string().min(1) }),
    output: pickupSchema,
  })
  completePickup(@Input('id') id: string) {
    return this.pickupsService.completePickup(id);
  }

  @Mutation({
    input: z.object({
      id: z.string().min(1),
      reason: z.string().optional(),
    }),
    output: pickupSchema,
  })
  failPickup(@Input('id') id: string) {
    return this.pickupsService.failPickup(id);
  }
}
