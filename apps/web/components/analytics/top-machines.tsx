"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, MapPin } from "lucide-react";
import { TopMachineRevenue } from "@/lib/types";

interface TopMachinesProps {
  machines: TopMachineRevenue[];
  isLoading?: boolean;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
};

export function TopMachines({ machines, isLoading }: TopMachinesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-light-text dark:text-dark-text">
            <Monitor
              className="h-5 w-5 text-green-600 dark:text-green-400"
              aria-hidden="true"
            />
            Machines les plus rentables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="space-y-3"
            role="list"
            aria-label="Chargement des machines les plus rentables"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-primary/50 rounded-lg animate-pulse"
                role="listitem"
                aria-hidden="true"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div>
                    <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-1"></div>
                    <div className="w-24 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-20 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  <div className="w-16 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (machines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-light-text dark:text-dark-text">
            <Monitor
              className="h-5 w-5 text-green-600 dark:text-green-400"
              aria-hidden="true"
            />
            Machines les plus rentables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="text-center text-light-textSecondary dark:text-dark-textSecondary py-8"
            role="status"
            aria-label="Aucune machine rentable"
          >
            <Monitor
              className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3"
              aria-hidden="true"
            />
            <p>Aucune vente ce mois-ci</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card role="region" aria-labelledby="top-machines-title">
      <CardHeader>
        <CardTitle
          id="top-machines-title"
          className="flex items-center gap-2 text-light-text dark:text-dark-text"
        >
          <Monitor
            className="h-5 w-5 text-green-600 dark:text-green-400"
            aria-hidden="true"
          />
          Machines les plus rentables
          <span className="text-sm font-normal text-light-textSecondary dark:text-dark-textSecondary ml-2">
            - Mois en cours
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="space-y-3"
          role="list"
          aria-label="Liste des machines les plus rentables"
        >
          {machines.map((machine, index) => (
            <div
              key={machine.machineId}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-primary/50 rounded-lg transition-colors"
              role="listitem"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-light-text dark:text-dark-text">
                    {machine.machineLabel}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-light-textSecondary dark:text-dark-textSecondary">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {machine.location}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-light-text dark:text-dark-text">
                  {formatCurrency(machine.totalRevenueCents)}
                </p>
                <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  {machine.totalOrders} commande
                  {machine.totalOrders > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
