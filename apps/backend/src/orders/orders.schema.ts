import { z } from 'zod';

export const orderItemSchema = z.object({
  id: z.string().min(1),
  order_id: z.string().min(1),
  product_id: z.string().min(1),
  quantity: z.number().int().positive(),
  slot_number: z.number().int().positive(),
});

export const orderSchema = z.object({
  id: z.string().min(1),
  user_id: z.string().min(1),
  machine_id: z.string().min(1),
  status: z.enum(['pending', 'active', 'expired', 'used', 'cancelled']),
  created_at: z.string(),
  expires_at: z.string(),
  qr_code_token: z.string(),
});

export const createOrderSchema = z.object({
  user_id: z.string().min(1),
  machine_id: z.string().min(1),
  items: z.array(
    z.object({
      product_id: z.string().min(1),
      quantity: z.number().int().positive(),
      slot_number: z.number().int().positive(),
    }),
  ),
});

export const updateOrderSchema = z.object({
  status: z
    .enum(['pending', 'active', 'expired', 'used', 'cancelled'])
    .optional(),
  expires_at: z.string().optional(),
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
