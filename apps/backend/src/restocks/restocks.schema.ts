import { z } from 'zod';

export const restockSchema = z.object({
  id: z.string().min(1),
  machine_id: z.string().min(1),
  user_id: z.string().min(1),
  created_at: z.string(),
  notes: z.string().optional(),
});

export const restockItemSchema = z.object({
  id: z.string().min(1),
  restock_id: z.string().min(1),
  stock_id: z.string().min(1),
  quantity_before: z.number().int().min(0),
  quantity_after: z.number().int().min(0),
  quantity_added: z.number().int(),
  type: z.enum(['addition', 'removal']).optional(),
});

export const createRestockSchema = z.object({
  machine_id: z.string().min(1),
  user_id: z.string().min(1),
  notes: z.string().optional(),
  items: z.array(z.object({
    stock_id: z.string().min(1),
    quantity_to_add: z.number().int().positive(),
  })).min(1),
});

export const restockWithItemsSchema = restockSchema.extend({
  items: z.array(restockItemSchema.extend({
    slot_number: z.number().int().positive(),
    product_name: z.string(),
    product_image_url: z.string().optional(),
  })),
});

export const restockToMaxSchema = z.object({
  machine_id: z.string().min(1),
  user_id: z.string().min(1).optional(), // Optionnel - sera déterminé automatiquement
  notes: z.string().optional(),
});

// Schéma pour ravitaillement d'un slot au maximum
export const restockSlotToMaxSchema = z.object({
  stock_id: z.string().min(1),
  user_id: z.string().min(1).optional(), // Optionnel - sera déterminé automatiquement
  notes: z.string().optional(),
});

// Schéma pour ravitaillement manuel d'un slot (garde pour compatibilité)
export const manualRestockSchema = z.object({
  stock_id: z.string().min(1),
  quantity: z.number().int().positive(),
  user_id: z.string().min(1).optional(), // Optionnel - sera déterminé automatiquement
  notes: z.string().optional(),
});

export type CreateRestockInput = z.infer<typeof createRestockSchema>;
export type RestockToMaxInput = z.infer<typeof restockToMaxSchema>;
export type RestockSlotToMaxInput = z.infer<typeof restockSlotToMaxSchema>;
export type ManualRestockInput = z.infer<typeof manualRestockSchema>;
export type Restock = z.infer<typeof restockSchema>;
export type RestockItem = z.infer<typeof restockItemSchema>;
export type RestockWithItems = z.infer<typeof restockWithItemsSchema>;
