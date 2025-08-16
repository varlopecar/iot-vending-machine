"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Edit,
  Wrench,
} from "lucide-react";
import { Card, CardContent, CardHeader, Button, Badge } from "../ui";
import { api } from "../../lib/trpc/client";
import Image from "next/image";

type StockLevel = "empty" | "low" | "normal" | "full";

interface SlotCardProps {
  slot: {
    id: string;
    slot_number: number;
    quantity: number;
    max_capacity: number;
    low_threshold: number;
    product_name: string;
    product_price: number;
    product_image_url?: string;
    product_id: string;
  };
  onEdit: (slotId: string) => void;
  onRestockComplete?: () => void;
}

const getStockLevel = (
  quantity: number,
  lowThreshold: number,
  maxCapacity: number
): StockLevel => {
  if (quantity === 0) return "empty";
  if (quantity <= lowThreshold) return "low";
  if (quantity === maxCapacity) return "full";
  return "normal";
};

const stockLevelConfig = {
  empty: {
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
    icon: AlertTriangle,
    label: "Vide",
    variant: "destructive" as const,
  },
  low: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    icon: AlertTriangle,
    label: "Stock faible",
    variant: "warning" as const,
  },
  normal: {
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    icon: Package,
    label: "En stock",
    variant: "secondary" as const,
  },
  full: {
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    borderColor: "border-green-200 dark:border-green-800",
    icon: CheckCircle,
    label: "Plein",
    variant: "success" as const,
  },
};

export function SlotCard({ slot, onEdit, onRestockComplete }: SlotCardProps) {
  const [isRestocking, setIsRestocking] = useState(false);

  // Mutation pour ravitailler au maximum
  const restockSlotMutation = api.restocks.restockSlotToMax.useMutation({
    retry: 3,
    retryDelay: 1000,
    onSuccess: () => {
      onRestockComplete?.();
      setIsRestocking(false);
    },
    onError: (error) => {
      
      setIsRestocking(false);
      if (
        error.message.includes("Server has closed") ||
        error.message.includes("connection")
      ) {
        alert(
          "Erreur de connexion. Le serveur redémarre peut-être. Réessayez dans quelques secondes."
        );
      } else {
        alert("Erreur: " + error.message);
      }
    },
  });

  const handleRestockSlot = () => {
    setIsRestocking(true);
    restockSlotMutation.mutate({
      stock_id: slot.id,
    });
  };

  const stockLevel = getStockLevel(
    slot.quantity,
    slot.low_threshold,
    slot.max_capacity
  );
  const config = stockLevelConfig[stockLevel];
  const StatusIcon = config.icon;

  const fillPercentage = (slot.quantity / slot.max_capacity) * 100;
  const needsRestock = slot.quantity < slot.max_capacity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`group hover:shadow-lg transition-all duration-200 ${config.borderColor} ${config.bgColor}`}
        role="article"
        aria-labelledby={`slot-title-${slot.id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              {/* Image du produit */}
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <Image
                  src="/assets/images/coca.png"
                  alt={slot.product_name}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>

              {/* Informations du slot */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                    Slot {slot.slot_number}
                  </span>
                  <Badge variant={config.variant} className="text-xs">
                    <StatusIcon className="w-3 h-3 mr-1" aria-hidden="true" />
                    {config.label}
                  </Badge>
                </div>
                <h3
                  id={`slot-title-${slot.id}`}
                  className="font-semibold text-sm leading-tight truncate"
                  title={slot.product_name}
                >
                  {slot.product_name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {slot.product_price.toFixed(2)}€
                </p>
              </div>
            </div>

            {/* Plus d'icônes d'action dans l'en-tête */}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Indicateur de stock visuel */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Stock</span>
              <span className={`font-medium ${config.color}`}>
                {slot.quantity}/{slot.max_capacity}
              </span>
            </div>
            <div
              className="w-full bg-muted rounded-full h-2"
              role="progressbar"
              aria-valuenow={slot.quantity}
              aria-valuemin={0}
              aria-valuemax={slot.max_capacity}
              aria-label={`Niveau de stock: ${slot.quantity} sur ${slot.max_capacity}`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  stockLevel === "empty"
                    ? "bg-red-500"
                    : stockLevel === "low"
                      ? "bg-yellow-500"
                      : stockLevel === "full"
                        ? "bg-green-500"
                        : "bg-blue-500"
                }`}
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>

          {/* Métriques du slot */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <div className="font-semibold">{slot.max_capacity}</div>
              <div className="text-muted-foreground">Capacité max</div>
            </div>
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <div className="font-semibold">{slot.low_threshold}</div>
              <div className="text-muted-foreground">Seuil critique</div>
            </div>
          </div>

          {/* Actions visibles en permanence */}
          <div className="border-t pt-3 space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => onEdit(slot.id)}
              aria-label={`Modifier le produit du slot ${slot.slot_number}`}
            >
              <Edit className="w-3 h-3 mr-2" />
              Modifier le produit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleRestockSlot}
              disabled={isRestocking || !needsRestock}
              aria-label={`Ravitailler le slot ${slot.slot_number} au maximum`}
            >
              {isRestocking ? (
                <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
              ) : (
                <Wrench className="w-3 h-3 mr-2" />
              )}
              Ravitailler au maximum
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
