"use client";

import { api } from "@/lib/trpc/client";
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
import type { Alert } from "@/lib/types/trpc";

const alertTypeConfig = {
  CRITICAL: {
    label: "Critique",
    icon: XCircle,
    color: "bg-red-100 text-red-800 border-red-200",
    iconColor: "text-red-600",
  },
  LOW_STOCK: {
    label: "Stock faible",
    icon: AlertTriangle,
    color: "bg-orange-100 text-orange-800 border-orange-200",
    iconColor: "text-orange-600",
  },
  INCOMPLETE: {
    label: "Incomplète",
    icon: AlertCircle,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    iconColor: "text-blue-600",
  },
} as const;

export function AlertsWidget() {
  const {
    data: alertsSummary,
    isLoading,
    refetch,
  } = api.alerts.getAlertsSummary.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alertes machines
          </CardTitle>
          <CardDescription>
            Surveillance en temps réel de vos machines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border rounded-lg animate-pulse"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="space-y-1">
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    <div className="w-16 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded"></div>
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
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alertes machines
          </CardTitle>
          <CardDescription>
            Surveillance en temps réel de vos machines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertTriangle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-green-800 mb-2">
              Aucune alerte active
            </h3>
            <p className="text-sm text-green-600">
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
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Alertes machines
        </CardTitle>
        <CardDescription>
          Surveillance en temps réel de vos machines
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Résumé des alertes */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {alertsSummary.criticalAlerts > 0 && (
            <Badge variant="destructive" className="text-xs">
              {alertsSummary.criticalAlerts} critique
              {alertsSummary.criticalAlerts > 1 ? "s" : ""}
            </Badge>
          )}
          {alertsSummary.lowStockAlerts > 0 && (
            <Badge
              variant="secondary"
              className="text-xs bg-orange-100 text-orange-800"
            >
              {alertsSummary.lowStockAlerts} stock faible
              {alertsSummary.lowStockAlerts > 1 ? "s" : ""}
            </Badge>
          )}
          {alertsSummary.incompleteAlerts > 0 && (
            <Badge variant="outline" className="text-xs">
              {alertsSummary.incompleteAlerts} incomplète
              {alertsSummary.incompleteAlerts > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {/* Liste des alertes par machine */}
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {alertsSummary.alertsByMachine.slice(0, 5).map((alert: Alert) => {
            const config =
              alertTypeConfig[alert.type as keyof typeof alertTypeConfig];
            const Icon = config?.icon || AlertTriangle;

            return (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Icon
                    className={cn("w-5 h-5 flex-shrink-0", config?.iconColor)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">
                      {alert.machine.label}
                    </div>
                    <div className="text-xs text-gray-600 flex items-center">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{alert.machine.location}</span>
                    </div>
                    {alert.message && (
                      <div className="text-xs text-gray-500 mt-1 truncate">
                        {alert.message}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    className={cn("text-xs", config?.color)}
                    variant="outline"
                  >
                    {config?.label}
                  </Badge>
                  <Link href={`/machines/${alert.machine_id}`}>
                    <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
                      <ExternalLink className="w-4 h-4" />
                      <span className="sr-only">Voir la machine</span>
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
            <p className="text-sm text-gray-500 mb-2">
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
