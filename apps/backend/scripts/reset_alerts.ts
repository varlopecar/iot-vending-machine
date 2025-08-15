import { PrismaClient, AlertType, AlertLevel, AlertStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function resetAndRecalculateAlerts() {
  console.log('🧹 Nettoyage et recalcul des alertes...');
  
  try {
    // 1. Supprimer toutes les alertes existantes
    const deletedAlerts = await prisma.alert.deleteMany({});
    console.log(`🗑️  ${deletedAlerts.count} alertes supprimées`);
    
    // 2. Récupérer toutes les machines avec leurs stocks
    const machines = await prisma.machine.findMany({
      include: {
        stocks: {
          include: {
            product: true
          }
        }
      }
    });
    
    console.log(`🏭 ${machines.length} machines trouvées`);
    
    // 3. Pour chaque machine, calculer et créer les nouvelles alertes
    for (const machine of machines) {
      console.log(`\n📊 Analyse de la machine: ${machine.label}`);
      
      const stocks = machine.stocks;
      const maxSlots = 6;
      const configuredSlots = stocks.length;
      const emptySlots = stocks.filter(stock => stock.quantity === 0).length;
      const lowStockSlots = stocks.filter(stock => 
        stock.quantity > 0 && stock.quantity <= stock.low_threshold
      ).length;
      const slotsAtThreshold = emptySlots + lowStockSlots;
      
      console.log(`  - Slots configurés: ${configuredSlots}/${maxSlots}`);
      console.log(`  - Slots vides: ${emptySlots}`);
      console.log(`  - Slots stock faible: ${lowStockSlots}`);
      console.log(`  - Slots sous seuil: ${slotsAtThreshold}`);
      
      const alerts: Array<{
        machine_id: string;
        type: AlertType;
        level: AlertLevel;
        status: AlertStatus;
        is_active: boolean;
        message: string;
        metadata: any;
        created_at: string;
      }> = [];
      
      // Alerte INCOMPLETE si moins de 6 slots configurés
      if (configuredSlots < maxSlots) {
        alerts.push({
          machine_id: machine.id,
          type: AlertType.INCOMPLETE,
          level: AlertLevel.WARNING,
          status: AlertStatus.OPEN,
          is_active: true,
          message: `Machine incomplète: ${configuredSlots}/${maxSlots} slots configurés`,
          metadata: {
            configured_slots: configuredSlots,
            total_slots: maxSlots,
          },
          created_at: new Date().toISOString(),
        });
        console.log(`  ⚠️  Alerte INCOMPLETE créée`);
      }
      
      // Alerte CRITICAL si ≥1 slot vide
      if (emptySlots >= 1) {
        alerts.push({
          machine_id: machine.id,
          type: AlertType.CRITICAL,
          level: AlertLevel.CRITICAL,
          status: AlertStatus.OPEN,
          is_active: true,
          message: `Stock critique: ${emptySlots} slot(s) vide(s) sur ${configuredSlots} configurés`,
          metadata: {
            empty_slots: emptySlots,
            low_stock_slots: lowStockSlots,
            total_slots: maxSlots,
            configured_slots: configuredSlots,
            slots_at_threshold: slotsAtThreshold,
          },
          created_at: new Date().toISOString(),
        });
        console.log(`  🔴 Alerte CRITICAL créée`);
      }
      // Sinon, alerte LOW si ≥50% des slots configurés sous le seuil
      else if (configuredSlots > 0 && slotsAtThreshold >= Math.ceil(configuredSlots * 0.5)) {
        alerts.push({
          machine_id: machine.id,
          type: AlertType.LOW_STOCK,
          level: AlertLevel.WARNING,
          status: AlertStatus.OPEN,
          is_active: true,
          message: `Stock faible: ${slotsAtThreshold}/${configuredSlots} slots sous le seuil critique`,
          metadata: {
            empty_slots: emptySlots,
            low_stock_slots: lowStockSlots,
            total_slots: maxSlots,
            configured_slots: configuredSlots,
            slots_at_threshold: slotsAtThreshold,
          },
          created_at: new Date().toISOString(),
        });
        console.log(`  🟡 Alerte LOW_STOCK créée`);
      }
      
      if (alerts.length === 0) {
        console.log(`  ✅ Aucune alerte nécessaire`);
      }
      
      // Créer les alertes
      for (const alertData of alerts) {
        await prisma.alert.create({
          data: alertData
        });
      }
    }
    
    // 4. Afficher le résumé final
    const finalAlerts = await prisma.alert.findMany({
      include: {
        machine: {
          select: {
            label: true
          }
        }
      }
    });
    
    console.log(`\n📈 Résumé final:`);
    console.log(`  - Total alertes: ${finalAlerts.length}`);
    console.log(`  - CRITICAL: ${finalAlerts.filter(a => a.type === 'CRITICAL').length}`);
    console.log(`  - LOW_STOCK: ${finalAlerts.filter(a => a.type === 'LOW_STOCK').length}`);
    console.log(`  - INCOMPLETE: ${finalAlerts.filter(a => a.type === 'INCOMPLETE').length}`);
    
    console.log(`\n📋 Détail des alertes:`);
    for (const alert of finalAlerts) {
      console.log(`  - ${alert.machine.label}: ${alert.type} - ${alert.message}`);
    }
    
    console.log('\n✅ Recalcul des alertes terminé!');
    
  } catch (error) {
    console.error('❌ Erreur lors du recalcul des alertes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAndRecalculateAlerts();
