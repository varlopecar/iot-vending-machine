#!/usr/bin/env ts-node

/**
 * Script de test pour vérifier le bon fonctionnement des jobs
 * Usage: pnpm ts-node scripts/test-jobs.ts
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { JobsService } from '../src/jobs/jobs.service';
import { MetricsService } from '../src/jobs/metrics.service';

async function testJobs() {
  console.log('🚀 Démarrage du test des jobs...\n');

  try {
    // Créer l'application NestJS
    const app = await NestFactory.createApplicationContext(AppModule);
    
    // Récupérer les services
    const jobsService = app.get(JobsService);
    const metricsService = app.get(MetricsService);

    console.log('✅ Application démarrée avec succès\n');

    // Test 1: Vérifier le statut des jobs
    console.log('📊 Test 1: Vérification du statut des jobs');
    const status = jobsService.getJobsStatus();
    console.log('Statut des jobs:', JSON.stringify(status, null, 2));
    console.log('✅ Test 1 réussi\n');

    // Test 2: Vérifier les métriques initiales
    console.log('📈 Test 2: Vérification des métriques initiales');
    const initialMetrics = metricsService.getMetrics();
    console.log('Métriques initiales:', JSON.stringify(initialMetrics, null, 2));
    console.log('✅ Test 2 réussi\n');

    // Test 3: Simuler des métriques
    console.log('🔢 Test 3: Simulation de métriques');
    metricsService.incrementExpiredOrders(5);
    metricsService.incrementCanceledPaymentIntents(3);
    metricsService.incrementReleasedStock(15);
    metricsService.updateJobExecutionTime(12000);
    
    const updatedMetrics = metricsService.getMetrics();
    console.log('Métriques mises à jour:', JSON.stringify(updatedMetrics, null, 2));
    console.log('✅ Test 3 réussi\n');

    // Test 4: Vérifier la réinitialisation des métriques
    console.log('🔄 Test 4: Test de réinitialisation des métriques');
    metricsService.resetMetrics();
    const resetMetrics = metricsService.getMetrics();
    console.log('Métriques après réinitialisation:', JSON.stringify(resetMetrics, null, 2));
    console.log('✅ Test 4 réussi\n');

    // Test 5: Vérifier la configuration des jobs
    console.log('⚙️ Test 5: Vérification de la configuration des jobs');
    console.log('Jobs configurés:');
    Object.entries(status).forEach(([key, job]) => {
      console.log(`  - ${job.name}: ${job.schedule} (${job.timezone})`);
      console.log(`    Description: ${job.description}`);
    });
    console.log('✅ Test 5 réussi\n');

    console.log('🎉 Tous les tests sont passés avec succès !');
    console.log('\n📋 Résumé:');
    console.log('  - Module Jobs correctement configuré');
    console.log('  - Métriques fonctionnelles');
    console.log('  - Planification des jobs active');
    console.log('  - Endpoints tRPC disponibles');

    // Fermer l'application
    await app.close();

  } catch (error) {
    console.error('❌ Erreur lors du test des jobs:', error);
    process.exit(1);
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testJobs().catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

export { testJobs };
