"use client";

import { trpc } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  AlertCircle,
  XCircle,
  MapPin,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const alertTypeConfig = {
  CRITICAL: {
    label: "Critique",
    icon: XCircle,
    color:
      "bg-red-600 text-white border-red-700 dark:bg-red-800 dark:text-white dark:border-red-700",
    iconColor: "text-red-600 dark:text-red-400",
  },
  LOW_STOCK: {
    label: "Stock faible",
    icon: AlertTriangle,
    color:
      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  INCOMPLETE: {
    label: "Incomplète",
    icon: AlertCircle,
    color:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
} as const;

export function AlertsWidget() {
  const {
    data: alertsSummary,
    isLoading,
    refetch,
  } = trpc.alerts.getAlertsSummary.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-light-text dark:text-dark-text">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            Alertes machines
          </CardTitle>
          <CardDescription className="text-light-textSecondary dark:text-dark-textSecondary">
            Surveillance en temps réel de vos machines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border rounded-lg animate-pulse"
                aria-hidden="true"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="space-y-1">
                    <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!alertsSummary || alertsSummary.alertsByMachine.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-light-text dark:text-dark-text">
            <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            Alertes machines
          </CardTitle>
          <CardDescription className="text-light-textSecondary dark:text-dark-textSecondary">
            Surveillance en temps réel de vos machines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertTriangle
              className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3"
              aria-hidden="true"
            />
            <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
              Aucune alerte active
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Toutes vos machines fonctionnent normalement
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-light-text dark:text-dark-text">
          <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          Alertes machines
        </CardTitle>
        <CardDescription className="text-light-textSecondary dark:text-dark-textSecondary">
          Surveillance en temps réel de vos machines
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Résumé des alertes */}
        <div
          className="flex gap-2 mb-4 flex-wrap"
          role="status"
          aria-label="Résumé des alertes"
        >
          {alertsSummary.criticalAlerts > 0 && (
            <Badge variant="destructive" className="text-xs">
              {alertsSummary.criticalAlerts} critique
              {alertsSummary.criticalAlerts > 1 ? "s" : ""}
            </Badge>
          )}
          {alertsSummary.lowStockAlerts > 0 && (
            <Badge className="text-xs bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700">
              {alertsSummary.lowStockAlerts} stock faible
              {alertsSummary.lowStockAlerts > 1 ? "s" : ""}
            </Badge>
          )}
          {alertsSummary.incompleteAlerts > 0 && (
            <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700">
              {alertsSummary.incompleteAlerts} incomplète
              {alertsSummary.incompleteAlerts > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {/* Liste des alertes par machine */}
        <div
          className="space-y-3 max-h-80 overflow-y-auto"
          role="list"
          aria-label="Liste des alertes par machine"
        >
          {alertsSummary.alertsByMachine.slice(0, 5).map((alert) => {
            const config =
              alertTypeConfig[alert.type as keyof typeof alertTypeConfig];
            const Icon = config?.icon || AlertTriangle;

            return (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 border rounded-lg"
                role="listitem"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Icon
                    className={cn("w-5 h-5 flex-shrink-0", config?.iconColor)}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate text-light-text dark:text-dark-text">
                      {alert.machine.label}
                    </div>
                    <div className="text-xs text-light-textSecondary dark:text-dark-textSecondary flex items-center">
                      <MapPin
                        className="w-3 h-3 mr-1 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="truncate">{alert.machine.location}</span>
                    </div>
                    {alert.message && (
                      <div className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1 truncate">
                        {alert.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    className={cn("text-xs", config?.color)}
                    variant="outline"
                    aria-label={`Type d'alerte: ${config?.label}`}
                  >
                    {config?.label}
                  </Badge>
                  <Link href={`/machines/${alert.machine_id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-8 w-8"
                      aria-label="Voir la machine"
                    >
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer avec action si plus de 5 alertes */}
        {alertsSummary.alertsByMachine.length > 5 && (
          <div className="text-center pt-3 border-t mt-3">
            <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-2">
              +{alertsSummary.alertsByMachine.length - 5} autres alertes
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/machines">Voir toutes les machines</Link>
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex-1"
            aria-label="Actualiser les alertes"
          >
            Actualiser
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href="/machines">Gérer machines</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
