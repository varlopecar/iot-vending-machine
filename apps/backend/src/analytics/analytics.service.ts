import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PopularProduct,
  TopMachineRevenue,
  CurrentMonthAnalytics,
  DashboardStats,
} from './analytics.schema';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère les 5 produits les plus populaires du mois en cours
   */
  async getPopularProductsCurrentMonth(): Promise<PopularProduct[]> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Convertir en timestamps string pour compatibilité avec le schéma Prisma
    const startDate = firstDayOfMonth.toISOString();
    const endDate = lastDayOfMonth.toISOString();

    const result = await this.prisma.$queryRaw<
      Array<{
        product_id: string;
        product_name: string;
        total_sold: bigint;
        total_revenue_cents: bigint;
      }>
    >`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal_cents) as total_revenue_cents
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE o.status = 'COMPLETED'
        AND o.created_at >= ${startDate}
        AND o.created_at <= ${endDate}
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `;

    return result.map((row) => ({
      productId: row.product_id,
      productName: row.product_name,
      totalSold: Number(row.total_sold),
      totalRevenueCents: Number(row.total_revenue_cents),
    }));
  }

  /**
   * Récupère les 5 machines avec le plus de revenus du mois en cours
   */
  async getTopMachinesByRevenueCurrentMonth(): Promise<TopMachineRevenue[]> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Convertir en timestamps string pour compatibilité avec le schéma Prisma
    const startDate = firstDayOfMonth.toISOString();
    const endDate = lastDayOfMonth.toISOString();

    const result = await this.prisma.$queryRaw<
      Array<{
        machine_id: string;
        machine_label: string;
        location: string;
        total_revenue_cents: bigint;
        total_orders: bigint;
      }>
    >`
      SELECT 
        m.id as machine_id,
        m.label as machine_label,
        m.location,
        SUM(o.amount_total_cents) as total_revenue_cents,
        COUNT(o.id) as total_orders
      FROM orders o
      JOIN machines m ON o.machine_id = m.id
      WHERE o.status = 'COMPLETED'
        AND o.created_at >= ${startDate}
        AND o.created_at <= ${endDate}
      GROUP BY m.id, m.label, m.location
      ORDER BY total_revenue_cents DESC
      LIMIT 5
    `;

    return result.map((row) => ({
      machineId: row.machine_id,
      machineLabel: row.machine_label,
      location: row.location,
      totalRevenueCents: Number(row.total_revenue_cents),
      totalOrders: Number(row.total_orders),
    }));
  }

  /**
   * Récupère les analytics du mois en cours (combinaison des deux fonctions précédentes)
   */
  async getCurrentMonthAnalytics(): Promise<CurrentMonthAnalytics> {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [popularProducts, topMachinesByRevenue] = await Promise.all([
      this.getPopularProductsCurrentMonth(),
      this.getTopMachinesByRevenueCurrentMonth(),
    ]);

    return {
      currentMonth,
      popularProducts,
      topMachinesByRevenue,
    };
  }

  /**
   * Récupère les statistiques générales pour le dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();

    // Mois en cours
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Mois précédent pour la comparaison
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const previousMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    // Semaine en cours
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Dimanche
    weekStart.setHours(0, 0, 0, 0);

    // Semaine précédente
    const previousWeekStart = new Date(weekStart);
    previousWeekStart.setDate(weekStart.getDate() - 7);
    const previousWeekEnd = new Date(weekStart);
    previousWeekEnd.setTime(weekStart.getTime() - 1);

    const [
      currentMonthRevenue,
      previousMonthRevenue,
      currentWeekSales,
      previousWeekSales,
      machinesCount,
      productsCount,
    ] = await Promise.all([
      // Revenus mois en cours
      this.prisma.$queryRaw<Array<{ total_revenue: bigint }>>`
        SELECT COALESCE(SUM(amount_total_cents), 0) as total_revenue
        FROM orders
        WHERE status = 'COMPLETED'
          AND created_at >= ${currentMonthStart.toISOString()}
          AND created_at <= ${currentMonthEnd.toISOString()}
      `,
      // Revenus mois précédent
      this.prisma.$queryRaw<Array<{ total_revenue: bigint }>>`
        SELECT COALESCE(SUM(amount_total_cents), 0) as total_revenue
        FROM orders
        WHERE status = 'COMPLETED'
          AND created_at >= ${previousMonthStart.toISOString()}
          AND created_at <= ${previousMonthEnd.toISOString()}
      `,
      // Ventes semaine en cours
      this.prisma.$queryRaw<Array<{ total_sales: bigint }>>`
        SELECT COALESCE(COUNT(*), 0) as total_sales
        FROM orders
        WHERE status = 'COMPLETED'
          AND created_at >= ${weekStart.toISOString()}
      `,
      // Ventes semaine précédente
      this.prisma.$queryRaw<Array<{ total_sales: bigint }>>`
        SELECT COALESCE(COUNT(*), 0) as total_sales
        FROM orders
        WHERE status = 'COMPLETED'
          AND created_at >= ${previousWeekStart.toISOString()}
          AND created_at <= ${previousWeekEnd.toISOString()}
      `,
      // Comptage des machines
      this.prisma.$queryRaw<Array<{ total: bigint; online: bigint }>>`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'ONLINE' THEN 1 END) as online
        FROM machines
      `,
      // Comptage des produits
      this.prisma.$queryRaw<Array<{ total: bigint; active: bigint }>>`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active
        FROM products
      `,
    ]);

    const currentRevenue = Number(currentMonthRevenue[0]?.total_revenue || 0);
    const previousRevenue = Number(previousMonthRevenue[0]?.total_revenue || 0);
    const currentSales = Number(currentWeekSales[0]?.total_sales || 0);
    const previousSales = Number(previousWeekSales[0]?.total_sales || 0);

    // Calcul des pourcentages de croissance
    const revenueGrowthPercent =
      previousRevenue > 0
        ? Math.round(
            ((currentRevenue - previousRevenue) / previousRevenue) * 100,
          )
        : 0;

    const salesGrowthPercent =
      previousSales > 0
        ? Math.round(((currentSales - previousSales) / previousSales) * 100)
        : 0;

    return {
      totalRevenueCents: currentRevenue,
      revenueGrowthPercent,
      totalSales: currentSales,
      salesGrowthPercent,
      totalMachines: Number(machinesCount[0]?.total || 0),
      onlineMachines: Number(machinesCount[0]?.online || 0),
      totalProducts: Number(productsCount[0]?.total || 0),
      activeProducts: Number(productsCount[0]?.active || 0),
    };
  }
}
