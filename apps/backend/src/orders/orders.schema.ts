import { z } from 'zod';

export const orderItemSchema = z.object({
  id: z.uuid(),
  order_id: z.uuid(),
  product_id: z.uuid(),
  quantity: z.number().int().positive(),
  slot_number: z.number().int().positive(),
});

export const orderSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  machine_id: z.uuid(),
  status: z.enum(['pending', 'active', 'expired', 'used', 'cancelled']),
  created_at: z.date(),
  expires_at: z.date(),
  qr_code_token: z.string(),
});

export const createOrderSchema = z.object({
  user_id: z.uuid(),
  machine_id: z.uuid(),
  items: z.array(
    z.object({
      product_id: z.uuid(),
      quantity: z.number().int().positive(),
      slot_number: z.number().int().positive(),
    }),
  ),
});

export const updateOrderSchema = z.object({
  status: z
    .enum(['pending', 'active', 'expired', 'used', 'cancelled'])
    .optional(),
  expires_at: z.date().optional(),
});

export const orderWithItemsSchema = orderSchema.extend({
  items: z.array(orderItemSchema),
  total_price: z.number().positive(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type Order = z.infer<typeof orderSchema>;
export type OrderItem = z.infer<typeof orderItemSchema>;
export type OrderWithItems = z.infer<typeof orderWithItemsSchema>;
