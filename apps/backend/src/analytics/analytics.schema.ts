import { z } from 'zod';

export const popularProductSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  totalSold: z.number(),
  totalRevenueCents: z.number(),
});

export const topMachineRevenueSchema = z.object({
  machineId: z.string(),
  machineLabel: z.string(),
  location: z.string(),
  totalRevenueCents: z.number(),
  totalOrders: z.number(),
});

export const monthlyAnalyticsSchema = z.object({
  month: z.string(), // Format YYYY-MM
  year: z.number(),
  monthNumber: z.number(),
  popularProducts: z.array(popularProductSchema),
  topMachinesByRevenue: z.array(topMachineRevenueSchema),
});

export const currentMonthAnalyticsSchema = z.object({
  currentMonth: z.string(),
  popularProducts: z.array(popularProductSchema),
  topMachinesByRevenue: z.array(topMachineRevenueSchema),
});

export const dashboardStatsSchema = z.object({
  totalRevenueCents: z.number(),
  revenueGrowthPercent: z.number(), // Croissance par rapport au mois précédent
  totalSales: z.number(),
  salesGrowthPercent: z.number(), // Croissance par rapport à la semaine précédente
  totalMachines: z.number(),
  onlineMachines: z.number(),
  totalProducts: z.number(),
  activeProducts: z.number(),
});

export type PopularProduct = z.infer<typeof popularProductSchema>;
export type TopMachineRevenue = z.infer<typeof topMachineRevenueSchema>;
export type MonthlyAnalytics = z.infer<typeof monthlyAnalyticsSchema>;
export type CurrentMonthAnalytics = z.infer<typeof currentMonthAnalyticsSchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
