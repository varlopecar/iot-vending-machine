"use client";

import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  XCircle,
  AlertCircle,
  WifiOff,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface MachineAlertBadgeProps {
  alertType:
    | "CRITICAL"
    | "LOW_STOCK"
    | "INCOMPLETE"
    | "MACHINE_OFFLINE"
    | "MAINTENANCE_REQUIRED"
    | null;
  className?: string;
}

const alertConfig = {
  CRITICAL: {
    label: "Stocks critiques",
    icon: XCircle,
    variant: "destructive" as const,
    className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
  },
  LOW_STOCK: {
    label: "Stocks faibles",
    icon: AlertTriangle,
    variant: "secondary" as const,
    className:
      "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
  },
  INCOMPLETE: {
    label: "Incomplète",
    icon: AlertCircle,
    variant: "outline" as const,
    className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
  },
  MACHINE_OFFLINE: {
    label: "Hors ligne",
    icon: WifiOff,
    variant: "destructive" as const,
    className: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
  },
  MAINTENANCE_REQUIRED: {
    label: "Maintenance",
    icon: Wrench,
    variant: "secondary" as const,
    className:
      "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200",
  },
} as const;

export function MachineAlertBadge({
  alertType,
  className,
}: MachineAlertBadgeProps) {
  if (!alertType) {
    return null;
  }

  const config = alertConfig[alertType];

  // Vérification de sécurité si le type n'est pas reconnu
  if (!config) {
    console.warn(`Type d'alerte non reconnu: ${alertType}`);
    return null;
  }

  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "text-xs font-medium flex items-center gap-1 transition-colors",
        config.className,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
