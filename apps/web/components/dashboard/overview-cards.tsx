"use client";

import { trpc } from "@/lib/trpc/client";
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
    trpc.analytics.getDashboardStats.useQuery();

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
        ? formatCurrency(dashboardStats.totalRevenueCents || 0)
        : "€0",
      description: dashboardStats
        ? `${formatGrowth(dashboardStats.revenueGrowthPercent || 0)} ce mois`
        : "0% ce mois",
      icon: Euro,
      loading: isLoading,
      growth: dashboardStats?.revenueGrowthPercent || 0,
    },
    {
      title: "Ventes",
      value: dashboardStats?.totalSales?.toString() || "0",
      description: dashboardStats
        ? `${formatGrowth(dashboardStats.salesGrowthPercent || 0)} cette semaine`
        : "0% cette semaine",
      icon: TrendingUp,
      loading: isLoading,
      growth: dashboardStats?.salesGrowthPercent || 0,
    },
  ];

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-w-0 overflow-hidden"
      role="region"
      aria-label="Statistiques de vue d'ensemble"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <Card
            key={index}
            role="article"
            aria-labelledby={`card-title-${index}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle
                id={`card-title-${index}`}
                className="text-sm font-medium text-light-text dark:text-dark-text"
              >
                {card.title}
              </CardTitle>
              <Icon
                className="h-4 w-4 text-light-textSecondary dark:text-dark-textSecondary"
                aria-hidden="true"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-light-text dark:text-dark-text">
                {card.loading ? (
                  <div
                    className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                    aria-hidden="true"
                  ></div>
                ) : (
                  card.value
                )}
              </div>
              {card.loading ? (
                <div
                  className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"
                  aria-hidden="true"
                ></div>
              ) : (
                <p
                  className={`text-sm mt-2 ${card.growth !== undefined
                    ? card.growth > 0
                      ? "text-green-700 dark:text-green-400"
                      : card.growth < 0
                        ? "text-red-700 dark:text-red-300"
                        : "text-light-textSecondary dark:text-dark-textSecondary"
                    : "text-light-textSecondary dark:text-dark-textSecondary"
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
