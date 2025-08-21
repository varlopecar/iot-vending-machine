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
import { Monitor, MapPin } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const statusConfig = {
  online: {
    label: "En ligne",
    color:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
    icon: "🟢",
  },
  offline: {
    label: "Hors ligne",
    color:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
    icon: "🔴",
  },
  maintenance: {
    label: "Maintenance",
    color:
      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",
    icon: "🟠",
  },
  out_of_service: {
    label: "Hors service",
    color:
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600",
    icon: "⚫",
  },
} as const;

export function MachineStatus() {
  const { data: machines, isLoading } = trpc.machines.getAllMachines.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-light-text dark:text-dark-text">
            État des machines
          </CardTitle>
          <CardDescription className="text-light-textSecondary dark:text-dark-textSecondary">
            Vue d&apos;ensemble du statut de vos machines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border rounded-lg"
                aria-hidden="true"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-1"></div>
                  </div>
                </div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!machines || machines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-light-text dark:text-dark-text">
            État des machines
          </CardTitle>
          <CardDescription className="text-light-textSecondary dark:text-dark-textSecondary">
            Vue d&apos;ensemble du statut de vos machines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-light-textSecondary dark:text-dark-textSecondary">
            <Monitor
              className="h-12 w-12 mx-auto mb-2 text-light-textSecondary dark:text-dark-textSecondary"
              aria-hidden="true"
            />
            <p>Aucune machine configurée</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-light-text dark:text-dark-text">
          État des machines
        </CardTitle>
        <CardDescription className="text-light-textSecondary dark:text-dark-textSecondary">
          Vue d&apos;ensemble du statut de vos machines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3" role="list" aria-label="Liste des machines">
          {machines.slice(0, 5).map((machine) => {
            const status =
              statusConfig[machine.status as keyof typeof statusConfig];

            return (
              <div
                key={machine.id}
                className="flex items-center justify-between p-3 border rounded-lg"
                role="listitem"
              >
                <div className="flex items-center space-x-3">
                  <Monitor
                    className="h-5 w-5 text-light-textSecondary dark:text-dark-textSecondary"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="font-medium text-light-text dark:text-dark-text">
                      {machine.label}
                    </div>
                    <div className="text-sm text-light-textSecondary dark:text-dark-textSecondary flex items-center">
                      <MapPin className="h-3 w-3 mr-1" aria-hidden="true" />
                      {machine.location}
                    </div>
                  </div>
                </div>
                <Badge
                  className={cn("text-xs", status.color)}
                  aria-label={`Statut: ${status.label}`}
                >
                  {status.icon} {status.label}
                </Badge>
              </div>
            );
          })}

          {machines.length > 5 && (
            <div className="text-center pt-2">
              <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                +{machines.length - 5} autres machines
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
