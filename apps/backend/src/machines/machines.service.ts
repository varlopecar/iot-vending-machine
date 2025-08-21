import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateMachineInput,
  UpdateMachineInput,
  Machine,
} from './machines.schema';
import { PrismaService } from '../prisma/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class MachinesService {
  private readonly logger = new Logger(MachinesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly alertsService: AlertsService,
  ) {}

  async createMachine(machineData: CreateMachineInput): Promise<Machine> {
    const created = await this.prisma.machine.create({
      data: {
        location: machineData.location,
        label: machineData.label,
        // Force le statut OFFLINE par défaut à la création
        status: 'OFFLINE',
        contact: machineData.contact ?? null,
        last_update: new Date().toISOString(),
      },
    });

    // Générer automatiquement les alertes pour la nouvelle machine
    try {
      await this.alertsService.updateMachineAlerts(created.id);
      this.logger.log(
        `Alertes générées pour la nouvelle machine ${created.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Erreur lors de la génération des alertes pour la machine ${created.id}:`,
        error,
      );
      // Ne pas faire échouer la création de la machine si la génération d'alertes échoue
    }

    return this.mapMachine(created);
  }

  async getAllMachines(): Promise<Machine[]> {
    const machines = await this.prisma.machine.findMany({
      orderBy: { last_update: 'desc' },
    });
    return machines.map(this.mapMachine);
  }

  async getMachineById(id: string): Promise<Machine> {
    const machine = await this.prisma.machine.findUnique({ where: { id } });
    if (!machine) {
      throw new NotFoundException('Machine not found');
    }
    return this.mapMachine(machine);
  }

  /**
   * Statistiques agrégées pour une machine
   */
  async getMachineStats(machineId: string) {
    // Comptages de slots
    const [totalSlots, lowStockCount, outOfStockCount] = await Promise.all([
      this.prisma.stock.count({ where: { machine_id: machineId } }),
      this.prisma.stock.count({
        where: {
          machine_id: machineId,
          quantity: { gt: 0 },
          // low_threshold >= quantity
          // Prisma n'autorise pas la comparaison directe entre champs,
          // on récupérera via filter côté code si nécessaire.
        },
      }),
      this.prisma.stock.count({
        where: { machine_id: machineId, quantity: 0 },
      }),
    ]);

    // Revenus: total et 30 derniers jours (commandes payées)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [ordersPaidAll, ordersPaid30d] = await Promise.all([
      this.prisma.order.findMany({
        where: { machine_id: machineId, paid_at: { not: null } },
        select: { amount_total_cents: true },
      }),
      this.prisma.order.findMany({
        where: {
          machine_id: machineId,
          paid_at: { not: null },
          created_at: { gte: thirtyDaysAgo.toISOString() },
        },
        select: { amount_total_cents: true },
      }),
    ]);

    const revenueTotalCents = ordersPaidAll.reduce(
      (sum, o) => sum + (o.amount_total_cents || 0),
      0,
    );
    const revenueLast30dCents = ordersPaid30d.reduce(
      (sum, o) => sum + (o.amount_total_cents || 0),
      0,
    );

    // Calcul lowStockCount réel et statistiques de stock
    const stockDetails = await this.prisma.stock.findMany({
      where: { machine_id: machineId },
      select: { quantity: true, low_threshold: true, max_capacity: true },
    });

    const lowStockCountReal = stockDetails.filter(
      (s) => s.quantity > 0 && s.quantity <= s.low_threshold,
    ).length;

    // Calcul des statistiques de stock globales
    const currentStockQuantity = stockDetails.reduce(
      (sum, s) => sum + s.quantity,
      0,
    );
    const maxCapacityTotal = stockDetails.reduce(
      (sum, s) => sum + s.max_capacity,
      0,
    );
    const stockPercentage =
      maxCapacityTotal > 0
        ? Math.min(
            100,
            Math.round((currentStockQuantity / maxCapacityTotal) * 100),
          ) // Limite à 100%
        : 0;

    return {
      machine_id: machineId,
      totalSlots,
      lowStockCount: lowStockCountReal,
      outOfStockCount,
      revenueTotalCents,
      revenueLast30dCents,
      ordersLast30d: ordersPaid30d.length,
      currentStockQuantity,
      maxCapacityTotal,
      stockPercentage,
    };
  }

  /**
   * Statistiques agrégées pour toutes les machines
   */
  async getAllMachineStats() {
    const machines = await this.prisma.machine.findMany({
      select: { id: true },
    });
    const stats = await Promise.all(
      machines.map((m) => this.getMachineStats(m.id)),
    );
    return stats;
  }

  async updateMachine(
    id: string,
    updateData: UpdateMachineInput,
  ): Promise<Machine> {
    try {
      const updated = await this.prisma.machine.update({
        where: { id },
        data: {
          ...('location' in updateData
            ? { location: updateData.location }
            : {}),
          ...('label' in updateData ? { label: updateData.label } : {}),
          ...('contact' in updateData
            ? { contact: updateData.contact ?? null }
            : {}),
          ...('status' in updateData
            ? { status: this.toDbStatus(updateData.status!) }
            : {}),
          last_update: new Date().toISOString(),
        },
      });
      return this.mapMachine(updated);
    } catch {
      throw new NotFoundException('Machine not found');
    }
  }

  async updateMachineStatus(
    id: string,
    status: Machine['status'],
  ): Promise<Machine> {
    return this.updateMachine(id, { status });
  }

  async deleteMachine(id: string): Promise<boolean> {
    try {
      await this.prisma.machine.delete({ where: { id } });
      return true;
    } catch {
      throw new NotFoundException('Machine not found');
    }
  }

  async getMachinesByLocation(location: string): Promise<Machine[]> {
    const machines = await this.prisma.machine.findMany({
      where: { location: { contains: location, mode: 'insensitive' } },
      orderBy: { label: 'asc' },
    });
    return machines.map(this.mapMachine);
  }

  async getOnlineMachines(): Promise<Machine[]> {
    const machines = await this.prisma.machine.findMany({
      where: { status: 'ONLINE' },
    });
    return machines.map(this.mapMachine);
  }

  private toApiStatus(db: string): Machine['status'] {
    return db.toLowerCase() as Machine['status'];
  }

  private toDbStatus(
    api: Machine['status'],
  ): 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' {
    switch (api) {
      case 'online':
        return 'ONLINE';
      case 'offline':
        return 'OFFLINE';
      case 'maintenance':
        return 'MAINTENANCE';
      case 'out_of_service':
        return 'OUT_OF_SERVICE';
    }
  }

  private mapMachine = (m: any): Machine => ({
    id: m.id,
    location: m.location,
    label: m.label,
    contact: m.contact ?? null,
    status: this.toApiStatus(m.status),
    last_update: m.last_update,
  });
}
