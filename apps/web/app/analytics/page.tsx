"use client";

import { motion } from "framer-motion";
import {
  RevenueChart,
  TopProductsChart,
  MachinePerformance,
} from "@/components/charts";
import { Card, CardContent } from "@/components/ui";
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

// Mock data pour les KPIs
const analytics = {
  totalRevenue: 4079.5,
  revenueGrowth: 12.3,
  totalOrders: 623,
  ordersGrowth: 8.7,
  avgOrderValue: 6.55,
  avgOrderGrowth: 3.2,
  conversionRate: 68.4,
  conversionGrowth: -2.1,
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight">Statistiques</h1>
        <p className="text-muted-foreground mt-2">
          Analyses et tendances de vos ventes
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Revenus totaux
                  </p>
                  <p className="text-2xl font-bold">
                    {analytics.totalRevenue.toFixed(2)}€
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {analytics.revenueGrowth > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={`text-xs ${
                        analytics.revenueGrowth > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {analytics.revenueGrowth > 0 ? "+" : ""}
                      {analytics.revenueGrowth}%
                    </span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Commandes</p>
                  <p className="text-2xl font-bold">{analytics.totalOrders}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {analytics.ordersGrowth > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={`text-xs ${
                        analytics.ordersGrowth > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {analytics.ordersGrowth > 0 ? "+" : ""}
                      {analytics.ordersGrowth}%
                    </span>
                  </div>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Panier moyen</p>
                  <p className="text-2xl font-bold">
                    {analytics.avgOrderValue.toFixed(2)}€
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {analytics.avgOrderGrowth > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={`text-xs ${
                        analytics.avgOrderGrowth > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {analytics.avgOrderGrowth > 0 ? "+" : ""}
                      {analytics.avgOrderGrowth}%
                    </span>
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Taux de conversion
                  </p>
                  <p className="text-2xl font-bold">
                    {analytics.conversionRate}%
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {analytics.conversionGrowth > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    )}
                    <span
                      className={`text-xs ${
                        analytics.conversionGrowth > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {analytics.conversionGrowth > 0 ? "+" : ""}
                      {analytics.conversionGrowth}%
                    </span>
                  </div>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <RevenueChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <TopProductsChart />
        </motion.div>
      </div>

      {/* Machine Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <MachinePerformance />
      </motion.div>
    </div>
  );
}
