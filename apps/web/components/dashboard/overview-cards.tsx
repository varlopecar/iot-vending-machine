"use client";

import { api } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Monitor, Package, Euro, TrendingUp } from "lucide-react";

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
};

const formatGrowth = (percent: number) => {
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent}%`;
};

export function OverviewCards() {
  const { data: dashboardStats, isLoading } =
    api.analytics.getDashboardStats.useQuery();

  const cards = [
    {
      title: "Machines",
      value: dashboardStats?.totalMachines?.toString() || "0",
      description: `${dashboardStats?.onlineMachines || 0} en ligne`,
      icon: Monitor,
      loading: isLoading,
    },
    {
      title: "Produits",
      value: dashboardStats?.activeProducts?.toString() || "0",
      description: `${dashboardStats?.activeProducts || 0} actifs`,
      icon: Package,
      loading: isLoading,
    },
    {
      title: "Revenus",
      value: dashboardStats
        ? formatCurrency(dashboardStats.totalRevenueCents)
        : "€0",
      description: dashboardStats
        ? `${formatGrowth(dashboardStats.revenueGrowthPercent)} ce mois`
        : "0% ce mois",
      icon: Euro,
      loading: isLoading,
      growth: dashboardStats?.revenueGrowthPercent,
    },
    {
      title: "Ventes",
      value: dashboardStats?.totalSales?.toString() || "0",
      description: dashboardStats
        ? `${formatGrowth(dashboardStats.salesGrowthPercent)} cette semaine`
        : "0% cette semaine",
      icon: TrendingUp,
      loading: isLoading,
      growth: dashboardStats?.salesGrowthPercent,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {card.loading ? (
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  card.value
                )}
              </div>
              {card.loading ? (
                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse mt-1"></div>
              ) : (
                <p
                  className={`text-xs mt-1 ${card.growth !== undefined
                      ? card.growth > 0
                        ? "text-green-600"
                        : card.growth < 0
                          ? "text-red-600"
                          : "text-gray-600"
                      : "text-gray-600"
                    }`}
                >
                  {card.description}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
