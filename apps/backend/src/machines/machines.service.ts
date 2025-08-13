import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateMachineInput,
  UpdateMachineInput,
  Machine,
} from './machines.schema';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MachinesService {
  constructor(private readonly prisma: PrismaService) {}

  async createMachine(machineData: CreateMachineInput): Promise<Machine> {
    const created = await this.prisma.machine.create({
      data: {
        location: machineData.location,
        label: machineData.label,
        status: this.toDbStatus(machineData.status),
        last_update: new Date().toISOString(),
      },
    });
    return this.mapMachine(created);
  }

  async getAllMachines(): Promise<Machine[]> {
    const machines = await this.prisma.machine.findMany({
      orderBy: { last_update: 'desc' },
    });
    return machines.map(this.mapMachine);
  }

  async getMachineById(id: string): Promise<Machine> {
    const machine = await this.prisma.machine.findUnique({ where: { id } });
    if (!machine) {
      throw new NotFoundException('Machine not found');
    }
    return this.mapMachine(machine);
  }

  async updateMachine(
    id: string,
    updateData: UpdateMachineInput,
  ): Promise<Machine> {
    try {
      const updated = await this.prisma.machine.update({
        where: { id },
        data: {
          ...('location' in updateData
            ? { location: updateData.location }
            : {}),
          ...('label' in updateData ? { label: updateData.label } : {}),
          ...('status' in updateData
            ? { status: this.toDbStatus(updateData.status!) }
            : {}),
          last_update: new Date().toISOString(),
        },
      });
      return this.mapMachine(updated);
    } catch {
      throw new NotFoundException('Machine not found');
    }
  }

  async updateMachineStatus(
    id: string,
    status: Machine['status'],
  ): Promise<Machine> {
    return this.updateMachine(id, { status });
  }

  async getMachinesByLocation(location: string): Promise<Machine[]> {
    const machines = await this.prisma.machine.findMany({
      where: { location: { contains: location, mode: 'insensitive' } },
      orderBy: { label: 'asc' },
    });
    return machines.map(this.mapMachine);
  }

  async getOnlineMachines(): Promise<Machine[]> {
    const machines = await this.prisma.machine.findMany({
      where: { status: 'ONLINE' },
    });
    return machines.map(this.mapMachine);
  }

  private toApiStatus(db: string): Machine['status'] {
    return db.toLowerCase() as Machine['status'];
  }

  private toDbStatus(
    api: Machine['status'],
  ): 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' {
    switch (api) {
      case 'online':
        return 'ONLINE';
      case 'offline':
        return 'OFFLINE';
      case 'maintenance':
        return 'MAINTENANCE';
      case 'out_of_service':
        return 'OUT_OF_SERVICE';
    }
  }

  private mapMachine = (m: any): Machine => ({
    id: m.id,
    location: m.location,
    label: m.label,
    status: this.toApiStatus(m.status),
    last_update: m.last_update,
  });
}
