import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExpireStaleOrdersJob } from './expire-stale-orders.job';
import { CleanupStalePaymentIntentsJob } from './cleanup-stale-payment-intents.job';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly expireStaleOrdersJob: ExpireStaleOrdersJob,
    private readonly cleanupStalePaymentIntentsJob: CleanupStalePaymentIntentsJob,
  ) {}

  /**
   * Job principal pour expirer les commandes non payées
   * Exécuté toutes les 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES, {
    name: 'expire-stale-orders',
    timeZone: 'Europe/Paris',
  })
  async handleExpireStaleOrders() {
    this.logger.log('🚀 Démarrage du job expire-stale-orders');
    
    try {
      const result = await this.expireStaleOrdersJob.execute();
      this.logger.log(`✅ Job expire-stale-orders terminé avec succès: ${result.ordersExpired} commandes expirées`);
    } catch (error) {
      this.logger.error('❌ Erreur lors de l\'exécution du job expire-stale-orders', error);
    }
  }

  /**
   * Job de nettoyage des PaymentIntents obsolètes
   * Exécuté tous les dimanches à 03:00 (heure de Paris)
   */
  @Cron('0 3 * * 0', {
    name: 'cleanup-stale-payment-intents',
    timeZone: 'Europe/Paris',
  })
  async handleCleanupStalePaymentIntents() {
    this.logger.log('🚀 Démarrage du job cleanup-stale-payment-intents');
    
    try {
      const result = await this.cleanupStalePaymentIntentsJob.execute();
      this.logger.log(`✅ Job cleanup-stale-payment-intents terminé avec succès: ${result.paymentIntentsCanceled} PIs annulés`);
    } catch (error) {
      this.logger.error('❌ Erreur lors de l\'exécution du job cleanup-stale-payment-intents', error);
    }
  }

  /**
   * Méthode pour exécuter manuellement le job d'expiration
   */
  async runExpireStaleOrdersManually() {
    this.logger.log('🔄 Exécution manuelle du job expire-stale-orders');
    return await this.expireStaleOrdersJob.execute();
  }

  /**
   * Méthode pour exécuter manuellement le job de nettoyage
   */
  async runCleanupStalePaymentIntentsManually() {
    this.logger.log('🔄 Exécution manuelle du job cleanup-stale-payment-intents');
    return await this.cleanupStalePaymentIntentsJob.execute();
  }

  /**
   * Récupérer le statut des jobs
   */
  getJobsStatus() {
    return {
      expireStaleOrders: {
        name: 'expire-stale-orders',
        schedule: '*/5 * * * *',
        timezone: 'Europe/Paris',
        description: 'Expire les commandes non payées toutes les 5 minutes',
      },
      cleanupStalePaymentIntents: {
        name: 'cleanup-stale-payment-intents',
        schedule: '0 3 * * 0',
        timezone: 'Europe/Paris',
        description: 'Nettoie les PaymentIntents obsolètes tous les dimanches à 03:00',
      },
    };
  }
}
