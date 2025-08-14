import { Input, Mutation, Query, Router } from 'nestjs-trpc';
import { MachinesService } from './machines.service';
import { z } from 'zod';
import {
  createMachineSchema,
  updateMachineSchema,
  machineSchema,
  machineStatsSchema,
} from './machines.schema';
import type { CreateMachineInput, UpdateMachineInput } from './machines.schema';

@Router({ alias: 'machines' })
export class MachinesRouter {
  constructor(private readonly machinesService: MachinesService) {}

  @Query({
    output: z.array(machineSchema),
  })
  getAllMachines() {
    return this.machinesService.getAllMachines();
  }

  @Query({
    input: z.object({ id: z.string().min(1) }),
    output: machineSchema,
  })
  getMachineById(@Input('id') id: string) {
    return this.machinesService.getMachineById(id);
  }

  @Query({
    input: z.object({ location: z.string() }),
    output: z.array(machineSchema),
  })
  getMachinesByLocation(@Input('location') location: string) {
    return this.machinesService.getMachinesByLocation(location);
  }

  @Query({
    output: z.array(machineSchema),
  })
  getOnlineMachines() {
    return this.machinesService.getOnlineMachines();
  }

  @Mutation({
    input: createMachineSchema,
    output: machineSchema,
  })
  createMachine(@Input() machineData: CreateMachineInput) {
    return this.machinesService.createMachine(machineData);
  }

  @Mutation({
    input: z.object({
      id: z.string().min(1),
      data: updateMachineSchema,
    }),
    output: machineSchema,
  })
  updateMachine(
    @Input('id') id: string,
    @Input('data') data: UpdateMachineInput,
  ) {
    return this.machinesService.updateMachine(id, data);
  }

  @Mutation({
    input: z.object({
      id: z.string().min(1),
      status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
    }),
    output: machineSchema,
  })
  updateMachineStatus(
    @Input('id') id: string,
    @Input('status')
    status: 'online' | 'offline' | 'maintenance' | 'out_of_service',
  ) {
    return this.machinesService.updateMachineStatus(id, status);
  }

  @Query({
    input: z.object({ id: z.string().min(1) }),
    output: machineStatsSchema,
  })
  getMachineStats(@Input('id') id: string) {
    return this.machinesService.getMachineStats(id);
  }

  @Query({
    output: z.array(machineStatsSchema),
  })
  getAllMachineStats() {
    return this.machinesService.getAllMachineStats();
  }
}
