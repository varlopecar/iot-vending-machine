import { Input, Query, Mutation, Router } from 'nestjs-trpc';
import { AlertsService } from './alerts.service';
import { z } from 'zod';
import {
  alertWithRelationsSchema,
  machineAlertStatusSchema,
  alertsSummarySchema,
} from './alerts.schema';

@Router({ alias: 'alerts' })
export class AlertsRouter {
  constructor(private readonly alertsService: AlertsService) {}

  @Query({
    output: z.array(alertWithRelationsSchema),
  })
  async getActiveAlerts() {
    return this.alertsService.getActiveAlerts();
  }

  @Query({
    input: z.object({ machineId: z.string() }),
    output: z.array(alertWithRelationsSchema),
  })
  async getMachineAlerts(@Input('machineId') machineId: string) {
    return this.alertsService.getMachineAlerts(machineId);
  }

  @Query({
    input: z.object({ machineId: z.string() }),
    output: machineAlertStatusSchema,
  })
  async getMachineAlertStatus(@Input('machineId') machineId: string) {
    return this.alertsService.calculateMachineAlertStatus(machineId);
  }

  @Query({
    output: z.array(alertWithRelationsSchema),
  })
  async getAlertsSummaryByMachine() {
    return this.alertsService.getAlertsSummaryByMachine();
  }

  @Query({
    output: alertsSummarySchema,
  })
  async getAlertsSummary() {
    const alerts = await this.alertsService.getActiveAlerts();
    const alertsByMachine = await this.alertsService.getAlertsSummaryByMachine();
    
    const summary = {
      totalAlerts: alerts.filter((a: any) => a.type !== 'INCOMPLETE').length,
      criticalAlerts: alerts.filter((a: any) => a.type === 'CRITICAL').length,
      lowStockAlerts: alerts.filter((a: any) => a.type === 'LOW_STOCK').length,
      incompleteAlerts: alerts.filter((a: any) => a.type === 'INCOMPLETE').length,
      alertsByMachine,
    };
    
    return summary;
  }

  @Mutation({
    input: z.object({ machineId: z.string() }),
    output: z.object({ success: z.boolean(), message: z.string() }),
  })
  async updateMachineAlerts(@Input('machineId') machineId: string) {
    try {
      await this.alertsService.updateMachineAlerts(machineId);
      return {
        success: true,
        message: `Alertes mises à jour pour la machine ${machineId}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de la mise à jour des alertes: ${error.message}`,
      };
    }
  }

  @Mutation({
    input: z.object({ alertId: z.string() }),
    output: z.object({ success: z.boolean(), message: z.string() }),
  })
  async resolveAlert(@Input('alertId') alertId: string) {
    try {
      await this.alertsService.resolveAlert(alertId);
      return {
        success: true,
        message: 'Alerte résolue avec succès',
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors de la résolution de l'alerte: ${error.message}`,
      };
    }
  }

  @Mutation({
    output: z.object({ 
      success: z.boolean(), 
      message: z.string(),
      machinesProcessed: z.number(),
    }),
  })
  async recalculateAllAlerts() {
    try {
      const machines = await this.alertsService['prisma'].machine.findMany({
        select: { id: true },
      });
      
      await this.alertsService.recalculateAllMachineAlerts();
      
      return {
        success: true,
        message: 'Toutes les alertes ont été recalculées',
        machinesProcessed: machines.length,
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors du recalcul des alertes: ${error.message}`,
        machinesProcessed: 0,
      };
    }
  }

  @Mutation({
    output: z.object({ 
      success: z.boolean(), 
      message: z.string(),
      cleaned: z.number(),
      machinesProcessed: z.number(),
    }),
  })
  async cleanupDuplicateAlerts() {
    try {
      const result = await this.alertsService.cleanupDuplicateAlerts();
      
      return {
        success: true,
        message: `${result.cleaned} alertes dupliquées nettoyées`,
        cleaned: result.cleaned,
        machinesProcessed: result.machinesProcessed,
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur lors du nettoyage des alertes: ${error.message}`,
        cleaned: 0,
        machinesProcessed: 0,
      };
    }
  }
}
