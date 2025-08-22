import Stripe from 'stripe';
import { validateEnv } from '../config/env.schema';

// Instance singleton du client Stripe
let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const env = validateEnv();

    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: env.STRIPE_API_VERSION as Stripe.LatestApiVersion,
      typescript: true,
    });
  }

  return stripeClient;
}

// Fonction utilitaire pour obtenir la clé publique
export function getStripePublishableKey(): string {
  const env = validateEnv();
  return env.STRIPE_PUBLISHABLE_KEY;
}

// Fonction utilitaire pour obtenir le secret webhook
export function getStripeWebhookSecret(): string {
  const env = validateEnv();
  return env.STRIPE_WEBHOOK_SECRET;
}

// Fonction pour nettoyer le client (utile pour les tests)
export function clearStripeClient(): void {
  stripeClient = null;
}
