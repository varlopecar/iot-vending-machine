import { z } from 'zod';

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  ingredients: z.string(),
  ingredients_list: z.array(z.string()).optional(),
  allergens: z.string(),
  allergens_list: z.array(z.string()).optional(),
  nutritional_value: z.string(),
  nutritional: z
    .object({
      calories: z.number().optional(),
      protein: z.number().optional(),
      carbs: z.number().optional(),
      fat: z.number().optional(),
      serving: z.string().optional(),
    })
    .optional(),
  image_url: z.url(),
  is_active: z.boolean(),
});

export const createProductSchema = productSchema.omit({
  id: true,
});

export const updateProductSchema = createProductSchema.partial();

export const productCategorySchema = z.enum(['snack', 'drink']);

export const productWithCategorySchema = productSchema.extend({
  category: productCategorySchema.optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductCategory = z.infer<typeof productCategorySchema>;
