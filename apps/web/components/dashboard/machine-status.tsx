"use client";

import { motion } from "framer-motion";
import { Monitor, Wifi, WifiOff, Wrench, XCircle, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";
import { formatCurrency } from "@/lib/utils/format";

// Mock data pour l'exemple
const machines = [
  {
    id: "MAC-001",
    name: "Machine Campus A",
    location: "Bâtiment Sciences",
    status: "online" as const,
    stockLevel: 85,
    lastOrder: "2 min",
    revenue: 145.5,
  },
  {
    id: "MAC-002",
    name: "Machine Cafétéria",
    location: "Cafétéria principale",
    status: "maintenance" as const,
    stockLevel: 65,
    lastOrder: "1h 23min",
    revenue: 98.75,
  },
  {
    id: "MAC-003",
    name: "Machine Bibliothèque",
    location: "Bibliothèque universitaire",
    status: "offline" as const,
    stockLevel: 45,
    lastOrder: "3h 12min",
    revenue: 76.25,
  },
];

const statusConfig = {
  online: {
    icon: Wifi,
    label: "En ligne",
    variant: "success" as const,
    color: "text-green-500",
  },
  offline: {
    icon: WifiOff,
    label: "Hors ligne",
    variant: "destructive" as const,
    color: "text-red-500",
  },
  maintenance: {
    icon: Wrench,
    label: "Maintenance",
    variant: "warning" as const,
    color: "text-yellow-500",
  },
  out_of_service: {
    icon: XCircle,
    label: "Hors service",
    variant: "destructive" as const,
    color: "text-red-500",
  },
};

export function MachineStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          État des machines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {machines.map((machine, index) => {
          const statusInfo = statusConfig[machine.status];
          const StatusIcon = statusInfo.icon;

          return (
            <motion.div
              key={machine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{machine.name}</h4>
                    <Badge variant={statusInfo.variant} className="text-xs">
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {machine.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {formatCurrency(machine.revenue)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    aujourd'hui
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {/* Stock level */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Stock</span>
                    <span
                      className={
                        machine.stockLevel > 70
                          ? "text-green-600"
                          : machine.stockLevel > 30
                            ? "text-yellow-600"
                            : "text-red-600"
                      }
                    >
                      {machine.stockLevel}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        machine.stockLevel > 70
                          ? "bg-green-500"
                          : machine.stockLevel > 30
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${machine.stockLevel}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Dernière commande: {machine.lastOrder}
                </div>
              </div>
            </motion.div>
          );
        })}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center pt-2"
        >
          <button className="text-sm text-primary hover:underline">
            Voir toutes les machines
          </button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
