"use client";

import { motion } from "framer-motion";
import {
  ShoppingCart,
  Euro,
  Monitor,
  AlertTriangle,
  TrendingUp,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatNumber, formatCurrency } from "@/lib/utils/format";
import type { DashboardStats } from "@/lib/types";

interface StatsCardsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  change,
  delay = 0,
}: {
  title: string;
  value: string | number;
  icon: any;
  change?: number;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div
            className={`text-xs flex items-center mt-1 ${
              change >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            {change >= 0 ? "+" : ""}
            {change}% ce mois
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const LoadingSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay }}
  >
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  </motion.div>
);

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <LoadingSkeleton key={i} delay={i * 0.1} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        title="Commandes totales"
        value={formatNumber(stats.totalOrders)}
        icon={ShoppingCart}
        change={12}
        delay={0}
      />
      <StatCard
        title="Revenus"
        value={formatCurrency(stats.totalRevenue)}
        icon={Euro}
        change={8}
        delay={0.1}
      />
      <StatCard
        title="Machines totales"
        value={stats.totalMachines}
        icon={Monitor}
        delay={0.2}
      />
      <StatCard
        title="Machines actives"
        value={stats.activeMachines}
        icon={Monitor}
        change={-2}
        delay={0.3}
      />
      <StatCard
        title="Stock faible"
        value={stats.lowStockItems}
        icon={AlertTriangle}
        delay={0.4}
      />
      <StatCard
        title="Ruptures"
        value={stats.outOfStockItems}
        icon={Package}
        delay={0.5}
      />
    </div>
  );
}
