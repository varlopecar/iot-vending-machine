import type Stripe from 'stripe';

// Types pour les paiements
export interface CreatePaymentIntentInput {
  amount: number; // Montant en centimes
  currency: string; // Devise (ex: 'eur')
  metadata: {
    order_id: string;
    user_id: string;
    machine_id: string;
  };
  supportsNativePay?: boolean; // Support Apple Pay / Google Pay
  platform?: 'ios' | 'android' | 'web'; // Plateforme client
}

export interface PaymentIntentResult {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
  metadata: Record<string, string>;
  supportsNativePay: boolean; // Support Apple Pay / Google Pay
  paymentMethodTypes: string[]; // Méthodes de paiement supportées
}

// Types pour les webhooks
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Stripe.Event.Data.Object;
  };
  created: number;
}

// Types pour les erreurs Stripe
export interface StripeError {
  type: string;
  code: string;
  message: string;
  decline_code?: string;
}

// Types pour la configuration
export interface StripeConfigData {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  apiVersion: string;
}
