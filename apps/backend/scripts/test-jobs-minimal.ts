#!/usr/bin/env ts-node

/**
 * Script de test minimal pour vérifier le bon fonctionnement des services des jobs
 * Usage: pnpm ts-node scripts/test-jobs-minimal.ts
 */

import { MetricsService } from '../src/jobs/metrics.service';

async function testJobsMinimal() {
  console.log('🚀 Démarrage du test minimal des jobs...\n');

  try {
    // Test 1: Créer et tester le MetricsService
    console.log('📊 Test 1: Test du MetricsService');
    const metricsService = new MetricsService();
    
    // Vérifier les métriques initiales
    const initialMetrics = metricsService.getMetrics();
    console.log('Métriques initiales:', JSON.stringify(initialMetrics, null, 2));
    console.log('✅ Test 1 réussi\n');

    // Test 2: Simuler des métriques
    console.log('🔢 Test 2: Simulation de métriques');
    metricsService.incrementExpiredOrders(5);
    metricsService.incrementCanceledPaymentIntents(3);
    metricsService.incrementReleasedStock(15);
    metricsService.updateJobExecutionTime(12000);
    
    const updatedMetrics = metricsService.getMetrics();
    console.log('Métriques mises à jour:', JSON.stringify(updatedMetrics, null, 2));
    console.log('✅ Test 2 réussi\n');

    // Test 3: Vérifier la réinitialisation des métriques
    console.log('🔄 Test 3: Test de réinitialisation des métriques');
    metricsService.resetMetrics();
    const resetMetrics = metricsService.getMetrics();
    console.log('Métriques après réinitialisation:', JSON.stringify(resetMetrics, null, 2));
    console.log('✅ Test 3 réussi\n');

    // Test 4: Vérifier l'accumulation des métriques
    console.log('📈 Test 4: Test d\'accumulation des métriques');
    metricsService.incrementExpiredOrders(10);
    metricsService.incrementExpiredOrders(5);
    metricsService.incrementCanceledPaymentIntents(7);
    metricsService.incrementReleasedStock(25);
    
    const finalMetrics = metricsService.getMetrics();
    console.log('Métriques finales:', JSON.stringify(finalMetrics, null, 2));
    
    // Vérifications
    if (finalMetrics.paymentsExpiredTotal === 15) {
      console.log('✅ Compteur des commandes expirées correct');
    } else {
      throw new Error(`Compteur incorrect: ${finalMetrics.paymentsExpiredTotal} au lieu de 15`);
    }
    
    if (finalMetrics.paymentIntentsCanceledTotal === 7) {
      console.log('✅ Compteur des PIs annulés correct');
    } else {
      throw new Error(`Compteur incorrect: ${finalMetrics.paymentIntentsCanceledTotal} au lieu de 7`);
    }
    
    if (finalMetrics.stockReleasedTotal === 25) {
      console.log('✅ Compteur du stock libéré correct');
    } else {
      throw new Error(`Compteur incorrect: ${finalMetrics.stockReleasedTotal} au lieu de 25`);
    }
    
    console.log('✅ Test 4 réussi\n');

    console.log('🎉 Tous les tests sont passés avec succès !');
    console.log('\n📋 Résumé:');
    console.log('  - MetricsService fonctionne correctement');
    console.log('  - Compteurs s\'incrémentent correctement');
    console.log('  - Réinitialisation fonctionne');
    console.log('  - Accumulation des métriques OK');

  } catch (error) {
    console.error('❌ Erreur lors du test des jobs:', error);
    process.exit(1);
  }
}

// Exécuter le test si le script est appelé directement
if (require.main === module) {
  testJobsMinimal().catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

export { testJobsMinimal };
