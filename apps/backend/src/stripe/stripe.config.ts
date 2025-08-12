import { validateEnv } from '../config/env.schema';

/**
 * Configuration Stripe centralisée
 * Utilise les variables d'environnement validées
 */
export class StripeConfig {
  private static instance: StripeConfig;
  private env = validateEnv();

  private constructor() {}

  static getInstance(): StripeConfig {
    if (!StripeConfig.instance) {
      StripeConfig.instance = new StripeConfig();
    }
    return StripeConfig.instance;
  }

  get secretKey(): string {
    return this.env.STRIPE_SECRET_KEY;
  }

  get publishableKey(): string {
    return this.env.STRIPE_PUBLISHABLE_KEY;
  }

  get webhookSecret(): string {
    return this.env.STRIPE_WEBHOOK_SECRET;
  }

  get apiVersion(): string {
    return this.env.STRIPE_API_VERSION;
  }

  get isTestMode(): boolean {
    return this.secretKey.startsWith('sk_test_');
  }

  get isLiveMode(): boolean {
    return this.secretKey.startsWith('sk_live_');
  }

  /**
   * Vérifie si la configuration est valide
   */
  validate(): boolean {
    try {
      validateEnv();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retourne la configuration pour les tests
   */
  static getTestConfig() {
    return {
      secretKey: 'sk_test_test_key_for_testing_only',
      publishableKey: 'pk_test_test_key_for_testing_only',
      webhookSecret: 'whsec_test_webhook_secret_for_testing',
      apiVersion: '2024-06-20',
    };
  }
}
