import { z } from 'zod';

export const productSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  ingredients: z.string(),
  allergens: z.string(),
  nutritional_value: z.string(),
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
