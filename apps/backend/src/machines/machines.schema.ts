import { z } from 'zod';

export const machineSchema = z.object({
  id: z.string().min(1),
  location: z.string(),
  label: z.string(),
  status: z.enum(['online', 'offline', 'maintenance', 'out_of_service']),
  last_update: z.string(),
});

export const createMachineSchema = machineSchema.omit({
  id: true,
  last_update: true,
});

export const updateMachineSchema = createMachineSchema.partial();

export type CreateMachineInput = z.infer<typeof createMachineSchema>;
export type UpdateMachineInput = z.infer<typeof updateMachineSchema>;
export type Machine = z.infer<typeof machineSchema>;
