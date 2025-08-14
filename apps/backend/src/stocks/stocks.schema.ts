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
  product_image_url: z.string().optional(),
  product_ingredients_list: z.array(z.string()).optional(),
  product_allergens_list: z.array(z.string()).optional(),
  product_nutritional: z
    .object({
      calories: z.number().optional(),
      protein: z.number().optional(),
      carbs: z.number().optional(),
      fat: z.number().optional(),
      serving: z.string().optional(),
    })
    .optional(),
});

export type CreateStockInput = z.infer<typeof createStockSchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
export type Stock = z.infer<typeof stockSchema>;
export type StockWithProduct = z.infer<typeof stockWithProductSchema>;
