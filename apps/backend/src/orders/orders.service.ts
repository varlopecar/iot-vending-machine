import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateOrderInput,
  UpdateOrderInput,
  Order,
  OrderItem,
  OrderWithItems,
} from './orders.schema';
import { randomUUID } from 'crypto';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async createOrder(orderData: CreateOrderInput): Promise<OrderWithItems> {
    await this.authService.getUserById(orderData.user_id);

    const qrCodeToken = this.generateQRCodeToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const createdAt = new Date().toISOString();

    const result = await this.prisma.$transaction(async (tx) => {
      // Validate stocks and decrement
      for (const item of orderData.items) {
        const stock = await tx.stock.findFirst({
          where: {
            machine_id: orderData.machine_id,
            product_id: item.product_id,
          },
        });
        if (!stock || stock.quantity < item.quantity) {
          const product = await tx.product.findUnique({
            where: { id: item.product_id },
          });
          throw new BadRequestException(
            `Insufficient stock for product ${product?.name ?? item.product_id}`,
          );
        }
        await tx.stock.update({
          where: { id: stock.id },
          data: { quantity: stock.quantity - item.quantity },
        });
      }

      const order = await tx.order.create({
        data: {
          user_id: orderData.user_id,
          machine_id: orderData.machine_id,
          status: 'ACTIVE',
          created_at: createdAt,
          expires_at: expiresAt,
          qr_code_token: qrCodeToken,
          points_spent: orderData.points_spent ?? 0,
          loyalty_applied: (orderData.points_spent ?? 0) > 0,
        },
      });

      const items = await Promise.all(
        orderData.items.map((it) =>
          tx.orderItem.create({
            data: {
              order_id: order.id,
              product_id: it.product_id,
              quantity: it.quantity,
              slot_number: it.slot_number,
            },
          }),
        ),
      );

      // Décrémenter les points fidélité si points_spent est fourni
      if (orderData.points_spent && orderData.points_spent > 0) {
        const user = await tx.user.findUnique({ where: { id: orderData.user_id } });
        if (!user) throw new NotFoundException('User not found');
        if (user.points < orderData.points_spent) {
          throw new BadRequestException('Insufficient loyalty points');
        }
        await tx.user.update({
          where: { id: orderData.user_id },
          data: { points: user.points - orderData.points_spent },
        });
      }

      return { order, items };
    });

    const total = await this.calculateOrderTotal(result.items);
    return this.mapOrderWithItems(result.order, result.items, total);
  }

  async getOrderById(id: string): Promise<OrderWithItems> {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    const items = await this.prisma.orderItem.findMany({
      where: { order_id: id },
    });
    const total = await this.calculateOrderTotal(items);
    return this.mapOrderWithItems(order, items, total);
  }

  async getOrdersByUserId(userId: string): Promise<OrderWithItems[]> {
    const orders = await this.prisma.order.findMany({
      where: { user_id: userId },
    });
    const itemsByOrder = await this.prisma.orderItem.findMany({
      where: { order_id: { in: orders.map((o) => o.id) } },
    });
    return await Promise.all(
      orders.map(async (o) => {
        const items = itemsByOrder.filter((i) => i.order_id === o.id);
        const total = await this.calculateOrderTotal(items);
        return this.mapOrderWithItems(o, items, total);
      }),
    );
  }

  async updateOrder(id: string, updateData: UpdateOrderInput): Promise<Order> {
    try {
      const updated = await this.prisma.order.update({
        where: { id },
        data: {
          ...('status' in updateData
            ? { status: this.toDbStatus(updateData.status!) }
            : {}),
          ...('expires_at' in updateData
            ? { expires_at: updateData.expires_at! }
            : {}),
        },
      });
      return this.mapOrder(updated);
    } catch {
      throw new NotFoundException('Order not found');
    }
  }

  async cancelOrder(id: string): Promise<Order> {
    const order = await this.getOrderById(id);
    if (order.status !== 'active') {
      throw new BadRequestException('Order cannot be cancelled');
    }

    const items = order.items;

    const updated = await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const stock = await tx.stock.findFirst({
          where: { machine_id: order.machine_id, product_id: item.product_id },
        });
        if (stock) {
          await tx.stock.update({
            where: { id: stock.id },
            data: { quantity: stock.quantity + item.quantity },
          });
        }
      }
      return await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    });

    return this.mapOrder(updated);
  }

  async validateQRCode(qrCodeToken: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { qr_code_token: qrCodeToken },
    });
    if (!order) throw new NotFoundException('Invalid QR code');
    if (order.status !== 'ACTIVE')
      throw new BadRequestException('Order is not active');
    if (new Date(order.expires_at) < new Date()) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('Order has expired');
    }
    return this.mapOrder(order);
  }

  async useOrder(id: string): Promise<Order> {
    const order = await this.getOrderById(id);
    if (order.status !== 'active')
      throw new BadRequestException('Order cannot be used');
    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: 'USED' },
    });
    return this.mapOrder(updated);
  }

  private async calculateOrderTotal(
    items: Array<{ product_id: string; quantity: number }>,
  ): Promise<number> {
    let total = 0;
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.product_id },
      });
      total += Number(product?.price ?? 0) * item.quantity;
    }
    return total;
  }

  private generateQRCodeToken(): string {
    return `qr_${randomUUID()}_${Date.now()}`;
  }

  private toApiStatus(db: string): Order['status'] {
    return db.toLowerCase() as Order['status'];
  }

  private toDbStatus(
    api: Order['status'],
  ): 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'USED' | 'CANCELLED' {
    switch (api) {
      case 'pending':
        return 'PENDING';
      case 'active':
        return 'ACTIVE';
      case 'expired':
        return 'EXPIRED';
      case 'used':
        return 'USED';
      case 'cancelled':
        return 'CANCELLED';
    }
  }

  private mapOrder = (o: any): Order => ({
    id: o.id,
    user_id: o.user_id,
    machine_id: o.machine_id,
    status: this.toApiStatus(o.status),
    created_at: o.created_at,
    expires_at: o.expires_at,
    qr_code_token: o.qr_code_token,
  });

  private mapOrderWithItems = (
    o: any,
    items: any[],
    total: number,
  ): OrderWithItems => ({
    ...this.mapOrder(o),
    items: items.map((it) => ({
      id: it.id,
      order_id: it.order_id,
      product_id: it.product_id,
      quantity: it.quantity,
      slot_number: it.slot_number,
    })),
    total_price: total,
  });
}
