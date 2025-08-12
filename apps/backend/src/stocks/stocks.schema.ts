import { z } from 'zod';

export const stockSchema = z.object({
  id: z.string().min(1),
  machine_id: z.string().min(1),
  product_id: z.string().min(1),
  quantity: z.number().int().min(0),
  slot_number: z.number().int().positive(),
});

export const createStockSchema = stockSchema.omit({
  id: true,
});

export const updateStockSchema = createStockSchema.partial();

export const stockWithProductSchema = stockSchema.extend({
  product_name: z.string(),
  product_price: z.number().positive(),
});

export type CreateStockInput = z.infer<typeof createStockSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
export type Stock = z.infer<typeof stockSchema>;
export type StockWithProduct = z.infer<typeof stockWithProductSchema>;
