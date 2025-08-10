import { z } from 'zod';

export const loyaltyLogSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid(),
  change: z.number().int(),
  reason: z.string(),
  created_at: z.date(),
});

export const advantageSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  points: z.number().int().positive(),
  image: z.string(),
});

export const historyEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  location: z.string(),
  points: z.number().int(),
});

export type LoyaltyLog = z.infer<typeof loyaltyLogSchema>;
export type Advantage = z.infer<typeof advantageSchema>;
export type HistoryEntry = z.infer<typeof historyEntrySchema>;
