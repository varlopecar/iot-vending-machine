import { z } from 'zod';

export const alertSchema = z.object({
  id: z.string(),
  machine_id: z.string(),
  stock_id: z.string().nullable(),
  type: z.enum([
    'LOW_STOCK',
    'CRITICAL',
    'INCOMPLETE',
    'MACHINE_OFFLINE',
    'MAINTENANCE_REQUIRED',
  ]),
  message: z.string().nullable(),
  level: z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']),
  status: z.enum(['OPEN', 'RESOLVED', 'IGNORED']),
  is_active: z.boolean(),
  created_at: z.string(),
  resolved_at: z.string().nullable(),
  metadata: z.any().nullable(),
});

export const alertWithRelationsSchema = alertSchema.extend({
  machine: z.object({
    id: z.string(),
    label: z.string(),
    location: z.string(),
    contact: z.string().nullable(),
    status: z.enum(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'OUT_OF_SERVICE']),
  }),
  stock: z
    .object({
      id: z.string(),
      slot_number: z.number(),
      quantity: z.number(),
      max_capacity: z.number(),
      low_threshold: z.number(),
      product: z.object({
        id: z.string(),
        name: z.string(),
        image_url: z.string(),
      }),
    })
    .nullable(),
});

export const machineAlertStatusSchema = z.object({
  machineId: z.string(),
  alertType: z
    .enum([
      'LOW_STOCK',
      'CRITICAL',
      'INCOMPLETE',
      'MACHINE_OFFLINE',
      'MAINTENANCE_REQUIRED',
    ])
    .nullable(),
  alertLevel: z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']).nullable(),
  configuredSlots: z.number(),
  totalSlots: z.number(),
  emptySlots: z.number(),
  lowStockSlots: z.number(),
  slotsAtThreshold: z.number(),
});

export const alertsSummarySchema = z.object({
  totalAlerts: z.number(),
  criticalAlerts: z.number(),
  lowStockAlerts: z.number(),
  incompleteAlerts: z.number(),
  alertsByMachine: z.array(alertWithRelationsSchema),
});

export type Alert = z.infer<typeof alertSchema>;
export type AlertWithRelations = z.infer<typeof alertWithRelationsSchema>;
export type MachineAlertStatus = z.infer<typeof machineAlertStatusSchema>;
export type AlertsSummary = z.infer<typeof alertsSummarySchema>;
