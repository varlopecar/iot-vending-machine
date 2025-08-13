"use client";

import { motion } from "framer-motion";
import {
  StatsCards,
  RecentOrders,
  MachineStatus,
} from "@/components/dashboard";
import type { DashboardStats } from "@/lib/types";

// Mock data pour l'exemple - à remplacer par les vraies données tRPC
const mockStats: DashboardStats = {
  totalOrders: 1247,
  totalRevenue: 2849.75,
  totalMachines: 12,
  activeMachines: 10,
  lowStockItems: 8,
  outOfStockItems: 3,
};

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground mt-2">
          Vue d'ensemble de vos machines de distribution
        </p>
      </motion.div>

      {/* Stats Cards */}
      <StatsCards stats={mockStats} />

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentOrders />
        <MachineStatus />
      </div>
    </div>
  );
}
