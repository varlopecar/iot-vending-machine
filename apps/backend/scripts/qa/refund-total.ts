#!/usr/bin/env ts-node

/**
 * Script QA pour tester les remboursements totaux
 * Usage: pnpm qa:refund:total PI_ID
 * 
 * Exemple: pnpm qa:refund:total pi_test_123
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Vérifier que la clé Stripe est disponible
if (!process.env.STRIPE_SECRET_KEY) {
  console.log('⚠️  STRIPE_SECRET_KEY non définie, utilisation d\'une clé de test');
  process.env.STRIPE_SECRET_KEY = 'sk_test_51Oq...'; // Clé de test factice
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
});

async function createTotalRefund(paymentIntentId: string) {
  try {
    console.log(`🧪 Test QA - Remboursement total`);
    console.log(`📋 Payment Intent ID: ${paymentIntentId}`);
    
    // Récupérer le Payment Intent pour vérifier qu'il existe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log(`✅ Payment Intent trouvé: ${paymentIntent.status}`);
    
    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Le Payment Intent doit être 'succeeded' pour être remboursé. Statut actuel: ${paymentIntent.status}`);
    }
    
    // Vérifier s'il y a déjà des remboursements
    const existingRefunds = await stripe.refunds.list({
      payment_intent: paymentIntentId,
      limit: 100,
    });
    
    const totalRefunded = existingRefunds.data.reduce((sum, refund) => sum + refund.amount, 0);
    const remainingAmount = paymentIntent.amount - totalRefunded;
    
    console.log(`💰 Montant total du paiement: ${paymentIntent.amount} centimes`);
    console.log(`💸 Montant déjà remboursé: ${totalRefunded} centimes`);
    console.log(`💳 Montant restant à rembourser: ${remainingAmount} centimes`);
    
    if (remainingAmount <= 0) {
      console.log(`⚠️  Le montant total a déjà été remboursé.`);
      return existingRefunds.data[0];
    }
    
    // Créer le remboursement total
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: remainingAmount,
      metadata: {
        qa_test: 'true',
        test_type: 'total_refund',
        amount_refunded: remainingAmount.toString(),
        timestamp: new Date().toISOString(),
        note: 'Remboursement total pour test QA',
      },
    });
    
    console.log(`✅ Remboursement total créé avec succès!`);
    console.log(`🆔 Refund ID: ${refund.id}`);
    console.log(`💰 Montant remboursé: ${refund.amount} centimes`);
    console.log(`📊 Statut: ${refund.status}`);
    
    // Afficher les détails du remboursement
    console.log(`\n📋 Détails du remboursement:`);
    console.log(`   - ID: ${refund.id}`);
    console.log(`   - Montant: ${refund.amount} centimes`);
    console.log(`   - Statut: ${refund.status}`);
    console.log(`   - Créé le: ${new Date(refund.created * 1000).toLocaleString()}`);
    console.log(`   - Métadonnées: ${JSON.stringify(refund.metadata, null, 2)}`);
    
    // Vérifier le statut final
    const finalRefunds = await stripe.refunds.list({
      payment_intent: paymentIntentId,
      limit: 100,
    });
    
    const finalTotalRefunded = finalRefunds.data.reduce((sum, r) => sum + r.amount, 0);
    console.log(`\n📊 Résumé final:`);
    console.log(`   - Montant total du paiement: ${paymentIntent.amount} centimes`);
    console.log(`   - Montant total remboursé: ${finalTotalRefunded} centimes`);
    console.log(`   - Nombre de remboursements: ${finalRefunds.data.length}`);
    
    if (finalTotalRefunded >= paymentIntent.amount) {
      console.log(`✅ Remboursement total confirmé!`);
      console.log(`🔔 La commande devrait maintenant avoir le statut 'REFUNDED'`);
    } else {
      console.log(`⚠️  Remboursement partiel: ${finalTotalRefunded}/${paymentIntent.amount} centimes`);
    }
    
    // Vérifier que le webhook sera déclenché
    console.log(`\n🔔 Le webhook 'refund.updated' sera automatiquement déclenché.`);
    console.log(`📝 Vérifiez les logs du serveur pour confirmer le traitement.`);
    
    return refund;
    
  } catch (error) {
    console.error(`❌ Erreur lors de la création du remboursement total:`);
    
    if (error instanceof Stripe.errors.StripeError) {
      console.error(`   - Type: ${error.type}`);
      console.error(`   - Code: ${error.code}`);
      console.error(`   - Message: ${error.message}`);
    } else {
      console.error(`   - Erreur: ${error}`);
    }
    
    process.exit(1);
  }
}

// Fonction principale
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 1) {
    console.error(`❌ Usage incorrect!`);
    console.error(`   Usage: pnpm qa:refund:total PI_ID`);
    console.error(`   Exemple: pnpm qa:refund:total pi_test_123`);
    process.exit(1);
  }
  
  const [paymentIntentId] = args;
  
  if (!paymentIntentId.startsWith('pi_')) {
    console.error(`❌ Payment Intent ID invalide: ${paymentIntentId}`);
    console.error(`   L'ID doit commencer par 'pi_'.`);
    process.exit(1);
  }
  
  console.log(`🚀 Démarrage du test QA - Remboursement total`);
  console.log(`===============================================`);
  
  await createTotalRefund(paymentIntentId);
  
  console.log(`\n✅ Test terminé avec succès!`);
  console.log(`📝 Vérifiez maintenant:`);
  console.log(`   1. Les logs du serveur pour le webhook 'refund.updated'`);
  console.log(`   2. La base de données pour la mise à jour du statut`);
  console.log(`   3. Le statut de la commande (devrait devenir 'REFUNDED')`);
  console.log(`   4. L'absence de double traitement (idempotence)`);
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  process.exit(1);
});

// Exécuter le script
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}
