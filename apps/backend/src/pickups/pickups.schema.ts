import { z } from 'zod';

export const pickupSchema = z.object({
  id: z.string().min(1),
  order_id: z.string().min(1),
  machine_id: z.string().min(1),
  picked_up_at: z.string(),
  status: z.enum(['pending', 'completed', 'failed']),
});

export const createPickupSchema = pickupSchema.omit({
  id: true,
  picked_up_at: true,
});

export const updatePickupSchema = createPickupSchema.partial();

export type CreatePickupInput = z.infer<typeof createPickupSchema>;
export type UpdatePickupInput = z.infer<typeof updatePickupSchema>;
export type Pickup = z.infer<typeof pickupSchema>;
