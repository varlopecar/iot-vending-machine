import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePickupInput, UpdatePickupInput, Pickup } from './pickups.schema';
import { OrdersService } from '../orders/orders.service';
import { randomUUID } from 'crypto';

@Injectable()
export class PickupsService {
  private pickups: Pickup[] = [];

  constructor(private readonly ordersService: OrdersService) {}

  createPickup(pickupData: CreatePickupInput): Pickup {
    // Validate that the order exists and is active
    const order = this.ordersService.getOrderById(pickupData.order_id);

    if (order.status !== 'active') {
      throw new BadRequestException('Order is not active for pickup');
    }

    const pickup: Pickup = {
      id: randomUUID(),
      ...pickupData,
      picked_up_at: new Date().toISOString(),
      status: 'pending',
    };

    this.pickups.push(pickup);
    return pickup;
  }

  getPickupById(id: string): Pickup {
    const pickup = this.pickups.find((p) => p.id === id);
    if (!pickup) {
      throw new NotFoundException('Pickup not found');
    }
    return pickup;
  }

  getPickupsByOrderId(orderId: string): Pickup[] {
    return this.pickups.filter((p) => p.order_id === orderId);
  }

  getPickupsByMachineId(machineId: string): Pickup[] {
    return this.pickups.filter((p) => p.machine_id === machineId);
  }

  updatePickup(id: string, updateData: UpdatePickupInput): Pickup {
    const pickupIndex = this.pickups.findIndex((p) => p.id === id);
    if (pickupIndex === -1) {
      throw new NotFoundException('Pickup not found');
    }

    this.pickups[pickupIndex] = {
      ...this.pickups[pickupIndex],
      ...updateData,
    };

    return this.pickups[pickupIndex];
  }

  completePickup(id: string): Pickup {
    const pickup = this.getPickupById(id);

    if (pickup.status !== 'pending') {
      throw new BadRequestException('Pickup is not pending');
    }

    // Mark the order as used
    this.ordersService.useOrder(pickup.order_id);

    return this.updatePickup(id, {
      status: 'completed',
    });
  }

  failPickup(id: string): Pickup {
    const pickup = this.getPickupById(id);

    if (pickup.status !== 'pending') {
      throw new BadRequestException('Pickup is not pending');
    }

    return this.updatePickup(id, {
      status: 'failed',
    });
  }

  getPendingPickups(): Pickup[] {
    return this.pickups.filter((p) => p.status === 'pending');
  }

  getCompletedPickups(): Pickup[] {
    return this.pickups.filter((p) => p.status === 'completed');
  }
}
