import { z } from 'zod';

export const machineSchema = z.object({
  id: z.string().min(1),
  location: z.string(),
  label: z.string(),
  contact: z.string().email().nullable().optional(),
  status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
  last_update: z.string(),
});

export const createMachineSchema = z.object({
  location: z.string(),
  label: z.string(),
  contact: z.string().email().optional(),
  // Statut optionnel côté input, mais ignoré: le backend force OFFLINE à la création
  status: z
    .enum(['online', 'offline', 'maintenance', 'out_of_service'])
    .optional()
});

export const updateMachineSchema = createMachineSchema.partial();

export type CreateMachineInput = z.infer<typeof createMachineSchema>;
export type UpdateMachineInput = z.infer<typeof updateMachineSchema>;
export type Machine = z.infer<typeof machineSchema>;

// Schéma pour les statistiques des machines
export const machineStatsSchema = z.object({
  machine_id: z.string().min(1),
  totalSlots: z.number().int().nonnegative(),
  lowStockCount: z.number().int().nonnegative(),
  outOfStockCount: z.number().int().nonnegative(),
  revenueTotalCents: z.number().int().nonnegative(),
  revenueLast30dCents: z.number().int().nonnegative(),
  ordersLast30d: z.number().int().nonnegative(),
  currentStockQuantity: z.number().int().nonnegative(), // Stock actuel total
  maxCapacityTotal: z.number().int().nonnegative(), // Capacité totale maximale
  stockPercentage: z.number().min(0).max(100), // Pourcentage de stock global
});

export type MachineStats = z.infer<typeof machineStatsSchema>;
