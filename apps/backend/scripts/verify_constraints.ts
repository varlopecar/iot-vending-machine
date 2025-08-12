#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script de vérification des contraintes de base de données
 */
async function verifyConstraints() {
  console.log('🔍 Vérification des contraintes de base de données...');

  try {
    // Vérifier la contrainte unique sur (machine_id, slot_number)
    console.log('📦 Vérification des contraintes de slots...');
    
    const duplicateSlots = await prisma.$queryRaw`
      SELECT machine_id, slot_number, COUNT(*) as count
      FROM stocks 
      GROUP BY machine_id, slot_number 
      HAVING COUNT(*) > 1
    `;

    if (Array.isArray(duplicateSlots) && duplicateSlots.length > 0) {
      console.warn('⚠️  Conflits de slots détectés:');
      for (const slot of duplicateSlots) {
        console.warn(`   - Machine ${slot.machine_id}, Slot ${slot.slot_number}: ${slot.count} occurrences`);
      }
    } else {
      console.log('✅ Aucun conflit de slots détecté');
    }

    // Vérifier la contrainte quantity >= 0
    console.log('📊 Vérification des quantités de stock...');
    
    const negativeQuantities = await prisma.stock.findMany({
      where: {
        quantity: { lt: 0 },
      },
    });

    if (negativeQuantities.length > 0) {
      console.warn(`⚠️  ${negativeQuantities.length} stocks ont des quantités négatives`);
      for (const stock of negativeQuantities) {
        console.warn(`   - Stock ${stock.id}: quantity=${stock.quantity}`);
      }
    } else {
      console.log('✅ Tous les stocks ont des quantités valides');
    }

    // Vérifier les snapshots des order_items
    console.log('🛒 Vérification des snapshots des order_items...');
    
    const invalidOrderItems = await prisma.orderItem.findMany({
      where: {
        OR: [
          { unit_price_cents: { lte: 0 } },
          { subtotal_cents: { lte: 0 } },
        ],
      },
    });

    if (invalidOrderItems.length > 0) {
      console.warn(`⚠️  ${invalidOrderItems.length} order_items ont des valeurs invalides`);
      for (const item of invalidOrderItems) {
        console.warn(
          `   - ${item.id}: unit_price_cents=${item.unit_price_cents}, subtotal_cents=${item.subtotal_cents}`,
        );
      }
    } else {
      console.log('✅ Tous les order_items ont des valeurs valides');
    }

    // Vérifier les orders
    console.log('📋 Vérification des orders...');
    
    const invalidOrders = await prisma.order.findMany({
      where: {
        OR: [
          { amount_total_cents: { lte: 0 } },
          { currency: null },
        ],
      },
    });

    if (invalidOrders.length > 0) {
      console.warn(`⚠️  ${invalidOrders.length} orders ont des valeurs invalides`);
      for (const order of invalidOrders) {
        console.warn(
          `   - ${order.id}: amount_total_cents=${order.amount_total_cents}, currency=${order.currency}`,
        );
      }
    } else {
      console.log('✅ Tous les orders ont des valeurs valides');
    }

    console.log('\n✅ Vérification des contraintes terminée!');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des contraintes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécution du script
if (require.main === module) {
  verifyConstraints()
    .then(() => {
      console.log('🎉 Script terminé avec succès!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export { verifyConstraints };
