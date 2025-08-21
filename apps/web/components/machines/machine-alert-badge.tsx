"use client";

import { Badge } from "@/components/ui/badge";
import { ExclamationTriangleIcon, XCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils/cn";

export interface MachineAlertBadgeProps {
  alertType: "CRITICAL" | "LOW_STOCK" | "INCOMPLETE" | "MACHINE_OFFLINE" | "MAINTENANCE_REQUIRED" | null;
  className?: string;
}

const alertConfig = {
  CRITICAL: {
    label: "Stocks critiques",
    icon: XCircleIcon,
    variant: "destructive" as const,
    className:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
  },
  LOW_STOCK: {
    label: "Stocks faibles",
    icon: ExclamationTriangleIcon,
    variant: "secondary" as const,
    className:
      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700",
  },
  INCOMPLETE: {
    label: "Incomplète",
    icon: ExclamationCircleIcon,
    variant: "outline" as const,
    className:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
  },
  MACHINE_OFFLINE: {
    label: "Machine hors ligne",
    icon: XCircleIcon,
    variant: "destructive" as const,
    className:
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700",
  },
  MAINTENANCE_REQUIRED: {
    label: "Maintenance requise",
    icon: ExclamationTriangleIcon,
    variant: "secondary" as const,
    className:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700",
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

    return null;
  }

  const Icon = config.icon;

  return (
    <Badge
      variant={undefined}
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
