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
import { Monitor, MapPin } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const statusConfig = {
  online: {
    label: "En ligne",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: "🟢",
  },
  offline: {
    label: "Hors ligne",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: "🔴",
  },
  maintenance: {
    label: "Maintenance",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: "🟠",
  },
  out_of_service: {
    label: "Hors service",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: "⚫",
  },
} as const;

export function MachineStatus() {
  const { data: machines, isLoading } = api.machines.getAllMachines.useQuery();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>État des machines</CardTitle>
          <CardDescription>
            Vue d'ensemble du statut de vos machines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  <div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mt-1"></div>
                  </div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
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
          <CardTitle>État des machines</CardTitle>
          <CardDescription>
            Vue d'ensemble du statut de vos machines
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <Monitor className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Aucune machine configurée</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>État des machines</CardTitle>
        <CardDescription>
          Vue d'ensemble du statut de vos machines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {machines.slice(0, 5).map((machine) => {
            const status =
              statusConfig[machine.status as keyof typeof statusConfig];

            return (
              <div
                key={machine.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Monitor className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="font-medium">{machine.label}</div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {machine.location}
                    </div>
                  </div>
                </div>
                <Badge className={cn("text-xs", status.color)}>
                  {status.icon} {status.label}
                </Badge>
              </div>
            );
          })}

          {machines.length > 5 && (
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                +{machines.length - 5} autres machines
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
