import { z } from 'zod';

// Schéma pour la création d'intention de paiement
export const createIntentSchema = z.object({
  orderId: z.string().uuid('OrderId doit être un UUID valide'),
});

// Schéma pour la récupération du statut
export const getStatusSchema = z.object({
  orderId: z.string().uuid('OrderId doit être un UUID valide'),
});

// Schéma de réponse pour createIntent
export const createIntentResponseSchema = z.object({
  publishableKey: z.string(),
  paymentIntentClientSecret: z.string(),
  customerId: z.string(),
  ephemeralKey: z.string(),
});

// Schéma de réponse pour getStatus
export const getStatusResponseSchema = z.object({
  orderStatus: z.string(),
  paymentStatus: z.string().nullable(),
  paidAt: z.string().nullable(),
  receiptUrl: z.string().nullable(),
  amountTotalCents: z.number().int().positive(),
  currency: z.string().length(3),
  qrCodeToken: z.string().nullable(),
  stripePaymentIntentId: z.string().nullable(),
});

// Types d'inférence
export type CreateIntentInput = z.infer<typeof createIntentSchema>;
export type GetStatusInput = z.infer<typeof getStatusSchema>;
export type CreateIntentResponse = z.infer<typeof createIntentResponseSchema>;
export type GetStatusResponse = z.infer<typeof getStatusResponseSchema>;

// Statuts de commande supportés pour le paiement
export const PAYABLE_ORDER_STATUSES = ['PENDING', 'FAILED'] as const;
export type PayableOrderStatus = typeof PAYABLE_ORDER_STATUSES[number];

// Statuts de commande après paiement
export const ORDER_STATUSES = [
  'PENDING',
  'REQUIRES_PAYMENT',
  'PAID',
  'FAILED',
  'CANCELLED',
  'EXPIRED',
  'REFUNDED',
] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];
