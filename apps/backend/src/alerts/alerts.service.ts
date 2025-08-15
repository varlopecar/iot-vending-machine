import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AlertType, AlertLevel, AlertStatus } from '@prisma/client';

export interface MachineAlertStatus {
  machineId: string;
  alertType: AlertType | null;
  alertLevel: AlertLevel | null;
  configuredSlots: number;
  totalSlots: number;
  emptySlots: number;
  lowStockSlots: number;
  slotsAtThreshold: number;
}

export interface AlertMetadata {
  slot_number?: number;
  current_quantity?: number;
  threshold?: number;
  product_name?: string;
  empty_slots?: number;
  low_stock_slots?: number;
  total_slots?: number;
  configured_slots?: number;
  slots_at_threshold?: number;
}

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calcule le statut d'alerte d'une machine en fonction de ses stocks
   */
  async calculateMachineAlertStatus(machineId: string): Promise<MachineAlertStatus> {
    // Récupérer tous les stocks de la machine
    const stocks = await this.prisma.stock.findMany({
      where: { machine_id: machineId },
      include: { product: true },
      orderBy: { slot_number: 'asc' },
    });

    const maxSlots = 6; // Nombre maximum de slots par machine
    const configuredSlots = stocks.length;
    const emptySlots = stocks.filter(stock => stock.quantity === 0).length;
    const lowStockSlots = stocks.filter(stock => 
      stock.quantity > 0 && stock.quantity <= stock.low_threshold
    ).length;
    const slotsAtThreshold = emptySlots + lowStockSlots;

    // Déterminer le type d'alerte selon les règles MVP
    let alertType: AlertType | null = null;
    let alertLevel: AlertLevel | null = null;

    // 1. CRITICAL si ≥1 slot vide
    if (emptySlots >= 1) {
      alertType = AlertType.CRITICAL;
      alertLevel = AlertLevel.CRITICAL;
    }
    // 2. LOW si slots ≤ seuil_critique ≥ 50% des slots configurés
    else if (configuredSlots > 0 && slotsAtThreshold >= Math.ceil(configuredSlots * 0.5)) {
      alertType = AlertType.LOW_STOCK;
      alertLevel = AlertLevel.WARNING;
    }
    // 3. INCOMPLETE indépendant (slots non configurés)
    // Note: INCOMPLETE est géré séparément car il peut coexister avec LOW/CRITICAL

    return {
      machineId,
      alertType,
      alertLevel,
      configuredSlots,
      totalSlots: maxSlots,
      emptySlots,
      lowStockSlots,
      slotsAtThreshold,
    };
  }

  /**
   * Vérifie si une machine a des slots non configurés
   */
  async checkIncompleteStatus(machineId: string): Promise<boolean> {
    const stocks = await this.prisma.stock.findMany({
      where: { machine_id: machineId },
    });
    
    const maxSlots = 6;
    return stocks.length < maxSlots;
  }

  /**
   * Met à jour ou crée les alertes pour une machine
   * Une seule alerte active par machine selon la priorité : CRITICAL > LOW_STOCK > INCOMPLETE
   */
  async updateMachineAlerts(machineId: string): Promise<void> {
    try {
      const alertStatus = await this.calculateMachineAlertStatus(machineId);
      const isIncomplete = await this.checkIncompleteStatus(machineId);

      await this.prisma.$transaction(async (tx) => {
        // Déterminer le type d'alerte prioritaire
        let alertType: AlertType | null = null;
        let alertLevel: AlertLevel | null = null;
        let message = '';
        let metadata: any = {};

        // Priorité 1: CRITICAL (≥1 slot vide)
        if (alertStatus.alertType === AlertType.CRITICAL) {
          alertType = AlertType.CRITICAL;
          alertLevel = AlertLevel.CRITICAL;
          message = `Stock critique: ${alertStatus.emptySlots} slot(s) vide(s) sur ${alertStatus.configuredSlots} configurés`;
          metadata = {
            empty_slots: alertStatus.emptySlots,
            low_stock_slots: alertStatus.lowStockSlots,
            total_slots: alertStatus.totalSlots,
            configured_slots: alertStatus.configuredSlots,
            slots_at_threshold: alertStatus.slotsAtThreshold,
          };
        }
        // Priorité 2: LOW_STOCK (≥50% des slots sous le seuil)
        else if (alertStatus.alertType === AlertType.LOW_STOCK) {
          alertType = AlertType.LOW_STOCK;
          alertLevel = AlertLevel.WARNING;
          message = `Stock faible: ${alertStatus.slotsAtThreshold}/${alertStatus.configuredSlots} slots sous le seuil critique`;
          metadata = {
            empty_slots: alertStatus.emptySlots,
            low_stock_slots: alertStatus.lowStockSlots,
            total_slots: alertStatus.totalSlots,
            configured_slots: alertStatus.configuredSlots,
            slots_at_threshold: alertStatus.slotsAtThreshold,
          };
        }
        // Priorité 3: INCOMPLETE (slots non configurés)
        else if (isIncomplete) {
          alertType = AlertType.INCOMPLETE;
          alertLevel = AlertLevel.WARNING;
          message = `Machine incomplète: ${alertStatus.configuredSlots}/${alertStatus.totalSlots} slots configurés`;
          metadata = {
            configured_slots: alertStatus.configuredSlots,
            total_slots: alertStatus.totalSlots,
          };
        }

        // Gérer l'alerte unique pour cette machine
        await this.handleSingleMachineAlert(tx, machineId, alertType, alertLevel, message, metadata);
      });

      this.logger.log(`Alertes mises à jour pour la machine ${machineId}`);
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour des alertes pour la machine ${machineId}:`, error);
      throw error;
    }
  }

  /**
   * Gère une seule alerte active par machine
   */
  private async handleSingleMachineAlert(
    tx: any, 
    machineId: string, 
    alertType: AlertType | null, 
    alertLevel: AlertLevel | null, 
    message: string, 
    metadata: any
  ) {
    // Récupérer l'alerte active existante pour cette machine
    const existingAlert = await tx.alert.findFirst({
      where: {
        machine_id: machineId,
        is_active: true,
      },
    });

    // Si pas d'alerte nécessaire
    if (!alertType) {
      if (existingAlert) {
        // Résoudre l'alerte existante
        await tx.alert.update({
          where: { id: existingAlert.id },
          data: {
            is_active: false,
            status: AlertStatus.RESOLVED,
            resolved_at: new Date().toISOString(),
          },
        });
        this.logger.log(`Alerte résolue pour la machine ${machineId}: ${existingAlert.type}`);
      }
      return;
    }

    // Si le type d'alerte a changé ou pas d'alerte existante
    if (!existingAlert || existingAlert.type !== alertType) {
      // Résoudre l'alerte existante si elle existe
      if (existingAlert) {
        await tx.alert.update({
          where: { id: existingAlert.id },
          data: {
            is_active: false,
            status: AlertStatus.RESOLVED,
            resolved_at: new Date().toISOString(),
          },
        });
        this.logger.log(`Alerte mise à jour pour la machine ${machineId}: ${existingAlert.type} → ${alertType}`);
      } else {
        this.logger.log(`Nouvelle alerte créée pour la machine ${machineId}: ${alertType}`);
      }

      // Créer la nouvelle alerte
      await tx.alert.create({
        data: {
          machine_id: machineId,
          type: alertType,
          level: alertLevel!,
          status: AlertStatus.OPEN,
          is_active: true,
          message,
          metadata,
          created_at: new Date().toISOString(),
        },
      });
    }
    // Si même type d'alerte, on peut mettre à jour le message et les métadonnées
    else if (existingAlert.message !== message) {
      await tx.alert.update({
        where: { id: existingAlert.id },
        data: {
          message,
          metadata,
        },
      });
      this.logger.log(`Message d'alerte mis à jour pour la machine ${machineId}: ${alertType}`);
    }
  }

  /**
   * Récupère toutes les alertes actives
   */
  async getActiveAlerts() {
    return this.prisma.alert.findMany({
      where: {
        is_active: true,
        status: AlertStatus.OPEN,
      },
      include: {
        machine: true,
        stock: {
          include: {
            product: true,
          },
        },
      },
      orderBy: [
        { level: 'desc' }, // CRITICAL d'abord
        { created_at: 'desc' },
      ],
    });
  }

  /**
   * Récupère les alertes actives pour une machine spécifique
   */
  async getMachineAlerts(machineId: string) {
    return this.prisma.alert.findMany({
      where: {
        machine_id: machineId,
        is_active: true,
        status: AlertStatus.OPEN,
      },
      include: {
        machine: true,
        stock: {
          include: {
            product: true,
          },
        },
      },
      orderBy: [
        { level: 'desc' },
        { created_at: 'desc' },
      ],
    });
  }

  /**
   * Récupère un résumé des alertes par machine (une alerte principale par machine)
   */
  async getAlertsSummaryByMachine() {
    const alerts = await this.getActiveAlerts();
    
    // Grouper les alertes par machine et prendre la plus prioritaire
    const alertsByMachine = new Map();
    
    for (const alert of alerts) {
      const machineId = alert.machine_id;
      const existing = alertsByMachine.get(machineId);
      
      if (!existing || this.getAlertPriority(alert.type) > this.getAlertPriority(existing.type)) {
        alertsByMachine.set(machineId, alert);
      }
    }
    
    return Array.from(alertsByMachine.values());
  }

  /**
   * Détermine la priorité d'un type d'alerte (plus élevé = plus prioritaire)
   */
  private getAlertPriority(alertType: AlertType): number {
    switch (alertType) {
      case AlertType.CRITICAL:
        return 3;
      case AlertType.LOW_STOCK:
        return 2;
      case AlertType.INCOMPLETE:
        return 1;
      default:
        return 0;
    }
  }

  /**
   * Résout manuellement une alerte
   */
  async resolveAlert(alertId: string) {
    return this.prisma.alert.update({
      where: { id: alertId },
      data: {
        is_active: false,
        status: AlertStatus.RESOLVED,
        resolved_at: new Date().toISOString(),
      },
    });
  }

  /**
   * Force la recalculation des alertes pour toutes les machines
   */
  async recalculateAllMachineAlerts(): Promise<void> {
    const machines = await this.prisma.machine.findMany({
      select: { id: true },
    });

    for (const machine of machines) {
      await this.updateMachineAlerts(machine.id);
    }

    this.logger.log(`Alertes recalculées pour ${machines.length} machines`);
  }

  /**
   * Nettoie toutes les alertes dupliquées dans la base de données
   * Garde seulement l'alerte la plus récente pour chaque machine
   */
  async cleanupDuplicateAlerts(): Promise<{ cleaned: number; machinesProcessed: number }> {
    const machines = await this.prisma.machine.findMany({
      select: { id: true },
    });

    let totalCleaned = 0;

    for (const machine of machines) {
      const activeAlerts = await this.prisma.alert.findMany({
        where: {
          machine_id: machine.id,
          is_active: true,
        } as any,
        orderBy: { created_at: 'desc' },
      });

      if (activeAlerts.length > 1) {
        // Garder seulement la plus récente, résoudre les autres
        const alertsToResolve = activeAlerts.slice(1); // Toutes sauf la première (plus récente)
        
        await this.prisma.alert.updateMany({
          where: {
            id: { in: alertsToResolve.map(a => a.id) },
          },
          data: {
            is_active: false,
            status: 'RESOLVED' as AlertStatus,
            resolved_at: new Date().toISOString(),
          } as any,
        });

        totalCleaned += alertsToResolve.length;
        this.logger.log(`Machine ${machine.id}: ${alertsToResolve.length} alerte(s) dupliquée(s) nettoyée(s)`);
      }
    }

    this.logger.log(`Nettoyage terminé: ${totalCleaned} alertes dupliquées résolues pour ${machines.length} machines`);
    
    return {
      cleaned: totalCleaned,
      machinesProcessed: machines.length,
    };
  }
}
