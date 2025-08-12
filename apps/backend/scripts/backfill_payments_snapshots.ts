#!/usr/bin/env ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script de backfill pour le système de paiement
 * Remplit les nouvelles colonnes avec les données existantes
 */
async function backfillPaymentsSnapshots() {
  console.log('🔄 Début du backfill des données de paiement...');

  try {
    // 1. Backfill des order_items avec les snapshots immuables
    console.log('📦 Backfill des order_items...');

    const orderItemsToUpdate = await prisma.orderItem.findMany({
      where: {
        OR: [
          { unit_price_cents: 0 },
          { subtotal_cents: 0 },
          { label: null },
        ],
      },
      include: {
        product: true,
        order: true,
      },
    });

    console.log(`📊 ${orderItemsToUpdate.length} order_items à mettre à jour`);

    for (const item of orderItemsToUpdate) {
      const unitPriceCents = Math.round(Number(item.product.price) * 100);
      const subtotalCents = unitPriceCents * item.quantity;
      const label = item.product.name;

      await prisma.orderItem.update({
        where: { id: item.id },
        data: {
          unit_price_cents: unitPriceCents,
          subtotal_cents: subtotalCents,
          label: label,
        },
      });

      console.log(
        `✅ Item ${item.id} mis à jour: ${label} - ${unitPriceCents}¢ x ${item.quantity} = ${subtotalCents}¢`,
      );
    }

    // 2. Backfill des orders avec amount_total_cents et currency
    console.log('📋 Backfill des orders...');

    const ordersToUpdate = await prisma.order.findMany({
      where: {
        amount_total_cents: 0,
      },
      include: {
        items: true,
      },
    });

    console.log(`📊 ${ordersToUpdate.length} orders à mettre à jour`);

    for (const order of ordersToUpdate) {
      // Calculer le montant total à partir des items
      const totalCents = order.items.reduce((sum, item) => sum + item.subtotal_cents, 0);

      await prisma.order.update({
        where: { id: order.id },
        data: {
          amount_total_cents: totalCents,
          currency: 'EUR', // Valeur par défaut
        },
      });

      console.log(`✅ Order ${order.id} mis à jour: ${totalCents}¢ EUR`);
    }

    // 3. Vérification des contraintes
    console.log('🔍 Vérification des contraintes...');

    // Vérifier que tous les order_items ont des valeurs valides
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

    // Vérifier que tous les orders ont des valeurs valides
    const invalidOrders = await prisma.order.findMany({
      where: {
        amount_total_cents: { lte: 0 },
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

    // 4. Statistiques finales
    const totalOrderItems = await prisma.orderItem.count();
    const totalOrders = await prisma.order.count();
    const totalProducts = await prisma.product.count();

    console.log('\n📊 Statistiques finales:');
    console.log(`   - Order items: ${totalOrderItems}`);
    console.log(`   - Orders: ${totalOrders}`);
    console.log(`   - Products: ${totalProducts}`);

    console.log('\n✅ Backfill terminé avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors du backfill:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Fonction de vérification des contraintes
 */
async function verifyConstraints() {
  console.log('🔍 Vérification des contraintes de base de données...');

  try {
    // Vérifier la contrainte unique sur (machine_id, slot_number)
    const duplicateSlots = await prisma.$queryRaw`
      SELECT machine_id, slot_number, COUNT(*) as count
      FROM stocks 
      GROUP BY machine_id, slot_number 
      HAVING COUNT(*) > 1
    `;

    if (Array.isArray(duplicateSlots) && duplicateSlots.length > 0) {
      console.warn('⚠️  Conflits de slots détectés:');
      for (const slot of duplicateSlots as Array<{ machine_id: string; slot_number: number; count: number }>) {
        console.warn(`   - Machine ${slot.machine_id}, Slot ${slot.slot_number}: ${slot.count} occurrences`);
      }
    } else {
      console.log('✅ Aucun conflit de slots détecté');
    }

    // Vérifier la contrainte quantity >= 0
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
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des contraintes:', error);
  }
}

// Exécution du script
if (require.main === module) {
  backfillPaymentsSnapshots()
    .then(() => verifyConstraints())
    .then(() => {
      console.log('🎉 Script terminé avec succès!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export { backfillPaymentsSnapshots, verifyConstraints };
