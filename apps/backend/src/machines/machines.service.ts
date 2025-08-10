import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateMachineInput,
  UpdateMachineInput,
  Machine,
} from './machines.schema';
import { randomUUID } from 'crypto';

@Injectable()
export class MachinesService {
  private machines: Machine[] = [];

  createMachine(machineData: CreateMachineInput): Machine {
    const machine: Machine = {
      id: randomUUID(),
      ...machineData,
      last_update: new Date(),
    };

    this.machines.push(machine);
    return machine;
  }

  getAllMachines(): Machine[] {
    return this.machines;
  }

  getMachineById(id: string): Machine {
    const machine = this.machines.find((m) => m.id === id);
    if (!machine) {
      throw new NotFoundException('Machine not found');
    }
    return machine;
  }

  updateMachine(id: string, updateData: UpdateMachineInput): Machine {
    const machineIndex = this.machines.findIndex((m) => m.id === id);
    if (machineIndex === -1) {
      throw new NotFoundException('Machine not found');
    }

    this.machines[machineIndex] = {
      ...this.machines[machineIndex],
      ...updateData,
      last_update: new Date(),
    };

    return this.machines[machineIndex];
  }

  updateMachineStatus(id: string, status: Machine['status']): Machine {
    return this.updateMachine(id, { status });
  }

  getMachinesByLocation(location: string): Machine[] {
    return this.machines.filter((machine) =>
      machine.location.toLowerCase().includes(location.toLowerCase()),
    );
  }

  getOnlineMachines(): Machine[] {
    return this.machines.filter((machine) => machine.status === 'online');
  }
}
