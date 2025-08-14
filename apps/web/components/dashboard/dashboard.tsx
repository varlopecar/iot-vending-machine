"use client";

import { api } from "@/lib/trpc/client";
import { OverviewCards } from "./overview-cards";
import { MachineStatus } from "./machine-status";

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Vue d'ensemble de votre plateforme de distributeurs automatiques
        </p>
      </div>

      {/* Overview Cards */}
      <OverviewCards />

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MachineStatus />

        {/* Placeholder for future charts */}
        <div className="bg-gray-100 rounded-lg p-6 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-lg font-medium mb-2">Graphiques à venir</div>
            <p className="text-sm">Revenus, ventes, statistiques détaillées</p>
          </div>
        </div>
      </div>
    </div>
  );
}
