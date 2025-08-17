"use client";

import {
  PopularProducts,
  TopMachines,
  ComingSoonCard,
} from "@/components/analytics";
import { TrendingUp, Clock } from "lucide-react";
import { api } from "@/lib/trpc/client";

export default function AnalyticsPage() {
  const {
    data: analytics,
    isLoading,
    error,
  } = api.analytics.getCurrentMonthAnalytics.useQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-gray-600 mt-1">
          Analyses détaillées de vos performances
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Erreur lors du chargement des statistiques : {error.message}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularProducts
          products={analytics?.popularProducts || []}
          isLoading={isLoading}
        />

        <TopMachines
          machines={analytics?.topMachinesByRevenue || []}
          isLoading={isLoading}
        />

        <ComingSoonCard
          title="Évolution des ventes"
          description="Tendances et graphiques d'évolution sur les derniers mois"
          icon={TrendingUp}
          iconColor="text-purple-600"
        />

        <ComingSoonCard
          title="Horaires de pointe"
          description="Analyse des pics de fréquentation par heure et jour"
          icon={Clock}
          iconColor="text-orange-600"
        />
      </div>
    </div>
  );
}
