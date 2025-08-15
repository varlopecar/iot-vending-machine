import { z } from 'zod';

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  description: z.string(),
  // Prix de vente
  price: z.number().min(0),
  // Prix d'achat
  purchase_price: z.number().min(0),
  // Catégorie libre pour le back-office
  category: z.string().min(1),
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
  image_url: z.string(),
  is_active: z.boolean(),
});

// Données minimales requises côté back-office pour créer un produit
export const createProductSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  price: z.number().positive(),
  purchase_price: z.number().positive(),
  // Optionnels
  allergens_list: z.array(z.string()).optional(),
  nutritional: z
    .object({
      calories: z.number().optional(),
      protein: z.number().optional(),
      carbs: z.number().optional(),
      fat: z.number().optional(),
      serving: z.string().optional(),
    })
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();

// Catégories non contraintes côté backend pour rester flexible dans le back-office

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type Product = z.infer<typeof productSchema>;
