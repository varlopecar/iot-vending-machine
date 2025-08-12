#!/usr/bin/env ts-node

/**
 * Script QA pour tester les remboursements partiels
 * Usage: pnpm qa:refund:partial PI_ID AMOUNT
 * 
 * Exemple: pnpm qa:refund:partial pi_test_123 1000
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

async function createPartialRefund(paymentIntentId: string, amount: number) {
  try {
    console.log(`🧪 Test QA - Remboursement partiel`);
    console.log(`📋 Payment Intent ID: ${paymentIntentId}`);
    console.log(`💰 Montant: ${amount} centimes (${(amount / 100).toFixed(2)}€)`);
    
    // Récupérer le Payment Intent pour vérifier qu'il existe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    console.log(`✅ Payment Intent trouvé: ${paymentIntent.status}`);
    
    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Le Payment Intent doit être 'succeeded' pour être remboursé. Statut actuel: ${paymentIntent.status}`);
    }
    
    // Créer le remboursement partiel
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount,
      metadata: {
        qa_test: 'true',
        test_type: 'partial_refund',
        amount_refunded: amount.toString(),
        timestamp: new Date().toISOString(),
      },
    });
    
    console.log(`✅ Remboursement partiel créé avec succès!`);
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
    
    // Vérifier que le webhook sera déclenché
    console.log(`\n🔔 Le webhook 'refund.updated' sera automatiquement déclenché.`);
    console.log(`📝 Vérifiez les logs du serveur pour confirmer le traitement.`);
    
    return refund;
    
  } catch (error) {
    console.error(`❌ Erreur lors de la création du remboursement partiel:`);
    
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
  
  if (args.length !== 2) {
    console.error(`❌ Usage incorrect!`);
    console.error(`   Usage: pnpm qa:refund:partial PI_ID AMOUNT`);
    console.error(`   Exemple: pnpm qa:refund:partial pi_test_123 1000`);
    process.exit(1);
  }
  
  const [paymentIntentId, amountStr] = args;
  const amount = parseInt(amountStr, 10);
  
  if (isNaN(amount) || amount <= 0) {
    console.error(`❌ Montant invalide: ${amountStr}`);
    console.error(`   Le montant doit être un nombre positif en centimes.`);
    process.exit(1);
  }
  
  if (!paymentIntentId.startsWith('pi_')) {
    console.error(`❌ Payment Intent ID invalide: ${paymentIntentId}`);
    console.error(`   L'ID doit commencer par 'pi_'.`);
    process.exit(1);
  }
  
  console.log(`🚀 Démarrage du test QA - Remboursement partiel`);
  console.log(`================================================`);
  
  await createPartialRefund(paymentIntentId, amount);
  
  console.log(`\n✅ Test terminé avec succès!`);
  console.log(`📝 Vérifiez maintenant:`);
  console.log(`   1. Les logs du serveur pour le webhook 'refund.updated'`);
  console.log(`   2. La base de données pour la mise à jour du statut`);
  console.log(`   3. L'absence de double traitement (idempotence)`);
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
