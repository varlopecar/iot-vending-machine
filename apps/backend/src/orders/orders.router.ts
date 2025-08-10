import { Input, Mutation, Query, Router } from 'nestjs-trpc';
import { OrdersService } from './orders.service';
import { z } from 'zod';
import {
  createOrderSchema,
  updateOrderSchema,
  orderSchema,
  orderWithItemsSchema,
} from './orders.schema';
import type { CreateOrderInput, UpdateOrderInput } from './orders.schema';

@Router({ alias: 'orders' })
export class OrdersRouter {
  constructor(private readonly ordersService: OrdersService) {}

  @Query({
    input: z.object({ id: z.uuid() }),
    output: orderWithItemsSchema,
  })
  getOrderById(@Input('id') id: string) {
    return this.ordersService.getOrderById(id);
  }

  @Query({
    input: z.object({ user_id: z.uuid() }),
    output: z.array(orderWithItemsSchema),
  })
  getOrdersByUserId(@Input('user_id') userId: string) {
    return this.ordersService.getOrdersByUserId(userId);
  }

  @Mutation({
    input: createOrderSchema,
    output: orderWithItemsSchema,
  })
  createOrder(@Input() orderData: CreateOrderInput) {
    return this.ordersService.createOrder(orderData);
  }

  @Mutation({
    input: z.object({
      id: z.uuid(),
      data: updateOrderSchema,
    }),
    output: orderSchema,
  })
  updateOrder(@Input('id') id: string, @Input('data') data: UpdateOrderInput) {
    return this.ordersService.updateOrder(id, data);
  }

  @Mutation({
    input: z.object({ id: z.uuid() }),
    output: orderSchema,
  })
  cancelOrder(@Input('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }

  @Mutation({
    input: z.object({ qr_code_token: z.string() }),
    output: orderSchema,
  })
  validateQRCode(@Input('qr_code_token') qrCodeToken: string) {
    return this.ordersService.validateQRCode(qrCodeToken);
  }

  @Mutation({
    input: z.object({ id: z.uuid() }),
    output: orderSchema,
  })
  useOrder(@Input('id') id: string) {
    return this.ordersService.useOrder(id);
  }
}
