import { z } from 'zod';

export const stockSchema = z.object({
  id: z.string().min(1),
  machine_id: z.string().min(1),
  product_id: z.string().min(1),
  quantity: z.number().int().min(0),
  slot_number: z.number().int().positive(),
  max_capacity: z.number().int().positive().default(4), // Maximum 4 produits par slot
  low_threshold: z.number().int().min(0).default(1), // Seuil bas à 1 pour tous
});

export const createStockSchema = stockSchema.omit({
  id: true,
});

export const updateStockSchema = createStockSchema.partial();

// Schéma pour ajouter un slot à une machine
export const addSlotSchema = z.object({
  machine_id: z.string().min(1),
  product_id: z.string().min(1),
  slot_number: z.number().int().positive(),
  initial_quantity: z.number().int().min(0).max(4).default(0), // Quantité initiale (0-4)
});

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
export type AddSlotInput = z.infer<typeof addSlotSchema>;
export type Stock = z.infer<typeof stockSchema>;
export type StockWithProduct = z.infer<typeof stockWithProductSchema>;
