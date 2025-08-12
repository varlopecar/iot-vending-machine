#!/usr/bin/env ts-node

import { config } from 'dotenv';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

// Charger les variables d'environnement
config();

interface CheckResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
}

class PaymentsSetupChecker {
  private stripe: Stripe;
  private prisma: PrismaClient;
  private results: CheckResult[] = [];

  constructor() {
    // Vérifier que Stripe est configuré
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY manquante dans .env');
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: (process.env.STRIPE_API_VERSION as any) || '2024-06-20',
    });

    this.prisma = new PrismaClient();
  }

  async runAllChecks(): Promise<void> {
    console.log('🔍 Vérification de la configuration des paiements Stripe...\n');

    await this.checkStripeKeys();
    await this.checkWebhookConfiguration();
    await this.checkPendingOrders();
    await this.checkDatabaseConnection();
    await this.checkStripeConnectivity();

    this.printResults();
    await this.cleanup();
  }

  private async checkStripeKeys(): Promise<void> {
    const result: CheckResult = {
      name: 'Clés Stripe',
      status: 'PASS',
      message: 'Configuration des clés Stripe valide',
    };

    try {
      // Vérifier que la clé secrète est en mode production
      if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
        result.status = 'WARNING';
        result.message = 'Clé Stripe en mode TEST - OK pour staging';
        result.details = {
          keyType: 'TEST',
          note: 'Utilisez sk_live_... pour la production'
        };
      } else if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) {
        result.status = 'PASS';
        result.message = 'Clé Stripe en mode PRODUCTION';
        result.details = {
          keyType: 'LIVE',
          note: 'Configuration production détectée'
        };
      } else {
        result.status = 'FAIL';
        result.message = 'Format de clé Stripe invalide';
        result.details = {
          keyFormat: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
          expected: 'sk_test_... ou sk_live_...'
        };
      }

      // Vérifier la clé publique
      if (!process.env.STRIPE_PUBLISHABLE_KEY) {
        result.status = 'FAIL';
        result.message = 'STRIPE_PUBLISHABLE_KEY manquante';
      } else if (process.env.STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_') && result.status === 'PASS') {
        result.status = 'WARNING';
        result.message = 'Clés Stripe en mode TEST - OK pour staging';
      }

      // Vérifier le secret webhook
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        result.status = 'FAIL';
        result.message = 'STRIPE_WEBHOOK_SECRET manquante';
      }

    } catch (error) {
      result.status = 'FAIL';
      result.message = 'Erreur lors de la vérification des clés';
      result.details = { error: error.message };
    }

    this.results.push(result);
  }

  private async checkWebhookConfiguration(): Promise<void> {
    const result: CheckResult = {
      name: 'Configuration Webhook',
      status: 'PASS',
      message: 'Webhooks Stripe configurés correctement',
    };

    try {
      const webhooks = await this.stripe.webhookEndpoints.list();
      
      if (webhooks.data.length === 0) {
        result.status = 'FAIL';
        result.message = 'Aucun webhook configuré';
        result.details = {
          count: 0,
          note: 'Configurez un webhook dans votre dashboard Stripe'
        };
      } else {
        const activeWebhooks = webhooks.data.filter(w => w.status === 'enabled');
        
        if (activeWebhooks.length === 0) {
          result.status = 'FAIL';
          result.message = 'Aucun webhook actif';
        } else {
          result.details = {
            total: webhooks.data.length,
            active: activeWebhooks.length,
            urls: activeWebhooks.map(w => w.url)
          };
        }
      }
    } catch (error) {
      result.status = 'FAIL';
      result.message = 'Erreur lors de la vérification des webhooks';
      result.details = { error: error.message };
    }

    this.results.push(result);
  }

  private async checkPendingOrders(): Promise<void> {
    const result: CheckResult = {
      name: 'Commandes en attente',
      status: 'PASS',
      message: 'Aucune commande en attente depuis +24h',
    };

    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const pendingOrders = await this.prisma.order.findMany({
        where: {
          OR: [
            { status: 'PENDING' },
            { status: 'REQUIRES_PAYMENT' }
          ],
          created_at: {
            lt: twentyFourHoursAgo
          }
        },
        select: {
          id: true,
          status: true,
          created_at: true,
          amount_total_cents: true
        }
      });

      if (pendingOrders.length > 0) {
        result.status = 'WARNING';
        result.message = `${pendingOrders.length} commande(s) en attente depuis +24h`;
        result.details = {
          count: pendingOrders.length,
          orders: pendingOrders.map(o => ({
            id: o.id,
            status: o.status,
            created: o.created_at,
            amount: o.amount_total_cents
          }))
        };
      } else {
        result.details = {
          count: 0,
          note: 'Toutes les commandes récentes sont traitées'
        };
      }
    } catch (error) {
      result.status = 'FAIL';
      result.message = 'Erreur lors de la vérification des commandes';
      result.details = { error: error.message };
    }

    this.results.push(result);
  }

  private async checkDatabaseConnection(): Promise<void> {
    const result: CheckResult = {
      name: 'Connexion Base de Données',
      status: 'PASS',
      message: 'Connexion à la base de données établie',
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      result.details = {
        status: 'Connected',
        note: 'Base de données accessible'
      };
    } catch (error) {
      result.status = 'FAIL';
      result.message = 'Impossible de se connecter à la base de données';
      result.details = { error: error.message };
    }

    this.results.push(result);
  }

  private async checkStripeConnectivity(): Promise<void> {
    const result: CheckResult = {
      name: 'Connectivité Stripe',
      status: 'PASS',
      message: 'API Stripe accessible',
    };

    try {
      // Tester la connectivité avec une requête simple
      const account = await this.stripe.accounts.retrieve();
      
      result.details = {
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        country: account.country
      };

      if (!account.charges_enabled) {
        result.status = 'WARNING';
        result.message = 'Compte Stripe configuré mais paiements non activés';
      }
    } catch (error) {
      result.status = 'FAIL';
      result.message = 'Impossible de se connecter à l\'API Stripe';
      result.details = { error: error.message };
    }

    this.results.push(result);
  }

  private printResults(): void {
    console.log('📊 Résultats de la vérification:\n');

    let passCount = 0;
    let failCount = 0;
    let warningCount = 0;

    this.results.forEach(result => {
      const statusIcon = {
        'PASS': '✅',
        'FAIL': '❌',
        'WARNING': '⚠️'
      }[result.status];

      console.log(`${statusIcon} ${result.name}: ${result.message}`);
      
      if (result.details) {
        console.log(`   ${JSON.stringify(result.details, null, 2)}`);
      }
      console.log('');

      if (result.status === 'PASS') passCount++;
      else if (result.status === 'FAIL') failCount++;
      else if (result.status === 'WARNING') warningCount++;
    });

    console.log('📈 Résumé:');
    console.log(`   ✅ Pass: ${passCount}`);
    console.log(`   ⚠️  Warnings: ${warningCount}`);
    console.log(`   ❌ Fail: ${failCount}`);

    if (failCount > 0) {
      console.log('\n🚨 Des erreurs critiques ont été détectées. Corrigez-les avant la mise en production.');
      process.exit(1);
    } else if (warningCount > 0) {
      console.log('\n⚠️  Des avertissements ont été détectés. Vérifiez-les avant la mise en production.');
    } else {
      console.log('\n🎉 Tous les tests sont passés ! Votre configuration est prête pour la production.');
    }
  }

  private async cleanup(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

// Exécution du script
async function main() {
  try {
    const checker = new PaymentsSetupChecker();
    await checker.runAllChecks();
  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
