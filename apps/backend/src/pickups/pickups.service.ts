import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePickupInput, UpdatePickupInput, Pickup } from './pickups.schema';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PickupsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPickup(pickupData: CreatePickupInput): Promise<Pickup> {
    const order = await this.prisma.order.findUnique({ where: { id: pickupData.order_id } });
    if (!order || order.status !== 'ACTIVE') {
      throw new BadRequestException('Order is not active for pickup');
    }

    const created = await this.prisma.pickup.create({
      data: {
        order_id: pickupData.order_id,
        machine_id: pickupData.machine_id,
        picked_up_at: new Date().toISOString(),
        status: 'PENDING',
      },
    });
    return this.mapPickup(created);
  }

  async getPickupById(id: string): Promise<Pickup> {
    const pickup = await this.prisma.pickup.findUnique({ where: { id } });
    if (!pickup) {
      throw new NotFoundException('Pickup not found');
    }
    return this.mapPickup(pickup);
  }

  async getPickupsByOrderId(orderId: string): Promise<Pickup[]> {
    const list = await this.prisma.pickup.findMany({ where: { order_id: orderId } });
    return list.map(this.mapPickup);
  }

  async getPickupsByMachineId(machineId: string): Promise<Pickup[]> {
    const list = await this.prisma.pickup.findMany({ where: { machine_id: machineId } });
    return list.map(this.mapPickup);
  }

  async updatePickup(id: string, updateData: UpdatePickupInput): Promise<Pickup> {
    try {
      const updated = await this.prisma.pickup.update({
        where: { id },
        data: {
          ...('order_id' in updateData ? { order_id: updateData.order_id! } : {}),
          ...('machine_id' in updateData ? { machine_id: updateData.machine_id! } : {}),
          ...('status' in updateData ? { status: this.toDbStatus(updateData.status!) } : {}),
        },
      });
      return this.mapPickup(updated);
    } catch {
      throw new NotFoundException('Pickup not found');
    }
  }

  async completePickup(id: string): Promise<Pickup> {
    const pickup = await this.getPickupById(id);
    if (pickup.status !== 'pending') {
      throw new BadRequestException('Pickup is not pending');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: pickup.order_id }, data: { status: 'USED' } });
      return await tx.pickup.update({ where: { id }, data: { status: 'COMPLETED' } });
    });
    return this.mapPickup(updated);
  }

  async failPickup(id: string): Promise<Pickup> {
    const pickup = await this.getPickupById(id);
    if (pickup.status !== 'pending') {
      throw new BadRequestException('Pickup is not pending');
    }
    const updated = await this.prisma.pickup.update({
      where: { id },
      data: { status: 'FAILED' },
    });
    return this.mapPickup(updated);
  }

  async getPendingPickups(): Promise<Pickup[]> {
    const list = await this.prisma.pickup.findMany({ where: { status: 'PENDING' } });
    return list.map(this.mapPickup);
  }

  async getCompletedPickups(): Promise<Pickup[]> {
    const list = await this.prisma.pickup.findMany({ where: { status: 'COMPLETED' } });
    return list.map(this.mapPickup);
  }

  private toApiStatus(db: string): Pickup['status'] {
    return db.toLowerCase() as Pickup['status'];
  }

  private toDbStatus(api: Pickup['status']): 'PENDING' | 'COMPLETED' | 'FAILED' {
    switch (api) {
      case 'pending':
        return 'PENDING';
      case 'completed':
        return 'COMPLETED';
      case 'failed':
        return 'FAILED';
    }
  }

  private mapPickup = (p: any): Pickup => ({
    id: p.id,
    order_id: p.order_id,
    machine_id: p.machine_id,
    picked_up_at: p.picked_up_at,
    status: this.toApiStatus(p.status),
  });
}
