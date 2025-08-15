"use client";

import { api } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Monitor, Package, Euro, TrendingUp } from "lucide-react";

export function OverviewCards() {
  const { data: machines, isLoading: machinesLoading } =
    api.machines.getAllMachines.useQuery();
  const { data: products, isLoading: productsLoading } =
    api.products.getAllProducts.useQuery();

  const totalMachines = machines?.length || 0;
  const onlineMachines =
    machines?.filter((m) => m.status === "online").length || 0;
  const totalProducts = products?.length || 0;
  const activeProducts = products?.filter((p) => p.is_active).length || 0;

  const cards = [
    {
      title: "Machines",
      value: totalMachines,
      description: `${onlineMachines} en ligne`,
      icon: Monitor,
      loading: machinesLoading,
    },
    {
      title: "Produits",
      value: totalProducts,
      description: `${activeProducts} actifs`,
      icon: Package,
      loading: productsLoading,
    },
    {
      title: "Revenus",
      value: "€2,345",
      description: "+12% ce mois",
      icon: Euro,
      loading: false,
    },
    {
      title: "Ventes",
      value: "156",
      description: "+8% cette semaine",
      icon: TrendingUp,
      loading: false,
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
                <p className="text-xs text-gray-600 mt-1">{card.description}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
