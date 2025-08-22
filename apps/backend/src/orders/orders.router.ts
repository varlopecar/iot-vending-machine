import { Input, Mutation, Query, Router } from 'nestjs-trpc';
import { OrdersService } from './orders.service';
import { TrpcAuthMiddleware } from '../auth/trpc-auth.middleware';
import { z } from 'zod';
import {
  createOrderSchema,
  updateOrderSchema,
  orderSchema,
  orderWithItemsSchema,
} from './orders.schema';
import type { CreateOrderInput, UpdateOrderInput } from './orders.schema';
import { UnauthorizedException } from '@nestjs/common';

@Router({ alias: 'orders' })
export class OrdersRouter {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly authMiddleware: TrpcAuthMiddleware,
  ) {}

  @Query({
    input: z.object({ id: z.string().min(1) }),
    output: orderWithItemsSchema,
  })
  async getOrderById(@Input('id') id: string, ctx: any) {
    // ✅ AUTHENTIFICATION RÉACTIVÉE
    const user = await this.authMiddleware.authenticateUser();
    const order = await this.ordersService.getOrderById(id);
    this.authMiddleware.requireOwnershipOrAdmin(user, order.user_id);

    return order;
  }

  @Query({
    input: z.object({ user_id: z.string().min(1) }),
    output: z.array(orderWithItemsSchema),
  })
  async getOrdersByUserId(@Input('user_id') userId: string, ctx: any) {
    // ✅ AUTHENTIFICATION RÉACTIVÉE
    const user = await this.authMiddleware.authenticateUser();
    this.authMiddleware.requireOwnershipOrAdmin(user, userId);

    return this.ordersService.getOrdersByUserId(userId);
  }

  @Mutation({
    input: createOrderSchema,
    output: orderWithItemsSchema,
  })
  async createOrder(@Input() orderData: CreateOrderInput, ctx: any) {
    // ✅ AUTHENTIFICATION RÉACTIVÉE - SÉCURITÉ COMPLÈTE
    const user = await this.authMiddleware.authenticateUser();
    this.authMiddleware.requireOwnershipOrAdmin(user, orderData.user_id);

    return this.ordersService.createOrder(orderData);
  }

  @Mutation({
    input: z.object({
      id: z.string().min(1),
      data: updateOrderSchema,
    }),
    output: orderSchema,
  })
  async updateOrder(
    @Input('id') id: string,
    @Input('data') data: UpdateOrderInput,
    ctx: any,
  ) {
    // ✅ AUTHENTIFICATION RÉACTIVÉE
    const user = await this.authMiddleware.authenticateUser();
    const order = await this.ordersService.getOrderById(id);
    this.authMiddleware.requireOwnershipOrAdmin(user, order.user_id);

    return this.ordersService.updateOrder(id, data);
  }

  @Mutation({
    input: z.object({ id: z.string().min(1) }),
    output: orderSchema,
  })
  async cancelOrder(@Input('id') id: string, ctx: any) {
    // ✅ AUTHENTIFICATION RÉACTIVÉE
    const user = await this.authMiddleware.authenticateUser();
    const order = await this.ordersService.getOrderById(id);
    this.authMiddleware.requireOwnershipOrAdmin(user, order.user_id);

    return this.ordersService.cancelOrder(id);
  }

  @Mutation({
    input: z.object({ qr_code_token: z.string() }),
    output: orderSchema,
  })
  async validateQRCode(@Input('qr_code_token') qrCodeToken: string, ctx: any) {
    // ✅ AUTHENTIFICATION RÉACTIVÉE - QR Code validation sécurisée
    const user = await this.authMiddleware.authenticateUser();

    return this.ordersService.validateQRCode(qrCodeToken);
  }

  @Mutation({
    input: z.object({ id: z.string().min(1) }),
    output: orderSchema,
  })
  async useOrder(@Input('id') id: string, ctx: any) {
    // ✅ AUTHENTIFICATION RÉACTIVÉE - Pour opérateurs de machine
    const user = await this.authMiddleware.authenticateUser();
    const order = await this.ordersService.getOrderById(id);
    this.authMiddleware.requireOwnershipOrAdmin(user, order.user_id);

    return this.ordersService.useOrder(id);
  }
}
