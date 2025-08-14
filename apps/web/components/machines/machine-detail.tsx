"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Wifi,
  WifiOff,
  Wrench,
  XCircle,
  RefreshCw,
  Package,
  AlertTriangle,
  History,
  Settings,
  Plus,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from "../ui";
import { SlotCard } from "./slot-card";
import { AddSlotModal } from "./add-slot-modal";
import { api } from "../../lib/trpc/client";

type MachineStatus = "online" | "offline" | "maintenance" | "out_of_service";

interface MachineDetailProps {
  machineId: string;
}

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

export function MachineDetail({ machineId }: MachineDetailProps) {
  const [restockingSlot, setRestockingSlot] = useState<string | null>(null);
  const [restockingAll, setRestockingAll] = useState(false);
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);

  // Récupération des données de la machine
  const {
    data: machine,
    isLoading: loadingMachine,
    error: machineError,
    refetch: refetchMachine,
  } = api.machines.getMachineById.useQuery({ id: machineId });

  // Récupération des stocks de la machine
  const {
    data: slots,
    isLoading: loadingSlots,
    error: slotsError,
    refetch: refetchSlots,
  } = api.stocks.getStocksByMachine.useQuery({ machine_id: machineId });

  // Mutation pour ravitailler une machine au maximum
  const restockToMaxMutation = api.restocks.restockToMax.useMutation({
    onSuccess: () => {
      refetchSlots();
      setRestockingAll(false);
    },
    onError: (error) => {
      console.error("Erreur lors du ravitaillement:", error);
      setRestockingAll(false);
    },
  });

  const handleRestockSlot = (slotId: string) => {
    setRestockingSlot(slotId);
    // TODO: Implémenter le ravitaillement d'un slot spécifique
    // Pour l'instant, on simule juste l'état de chargement
    setTimeout(() => {
      setRestockingSlot(null);
    }, 2000);
  };

  const handleRestockAll = () => {
    if (!machine) return;

    setRestockingAll(true);
    restockToMaxMutation.mutate({
      machine_id: machineId,
      // On va récupérer l'admin depuis le backend
      notes: `Ravitaillement complet de la machine ${machine.label}`,
    });
  };

  const handleEditSlot = (slotId: string) => {
    // TODO: Ouvrir un modal pour éditer le produit du slot
    console.log("Éditer le slot:", slotId);
  };

  const isLoading = loadingMachine || loadingSlots;
  const error = machineError || slotsError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/machines">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux machines
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center py-12">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
            role="status"
            aria-label="Chargement de la machine"
          ></div>
        </div>
      </div>
    );
  }

  if (error || !machine) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/machines">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux machines
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4" role="alert">
            Erreur lors du chargement de la machine:{" "}
            {error?.message || "Machine non trouvée"}
          </div>
          <Button
            onClick={() => {
              refetchMachine();
              refetchSlots();
            }}
            variant="outline"
            aria-label="Réessayer le chargement"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[machine.status as MachineStatus];
  const StatusIcon = statusInfo.icon;

  // Calculer les statistiques des slots
  const totalSlots = slots?.length || 0;
  const emptySlots = slots?.filter((slot) => slot.quantity === 0).length || 0;
  const lowStockSlots =
    slots?.filter(
      (slot) => slot.quantity > 0 && slot.quantity <= slot.low_threshold
    ).length || 0;
  const fullSlots =
    slots?.filter((slot) => slot.quantity === slot.max_capacity).length || 0;
  const needsRestockSlots =
    slots?.filter((slot) => slot.quantity < slot.max_capacity).length || 0;

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div className="flex items-center gap-4">
          <Link href="/machines">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux machines
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {machine.label}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              <span>{machine.location}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusInfo.variant}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </Button>
        </div>
      </motion.div>

      {/* Informations générales de la machine */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Vue d'ensemble
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">{totalSlots}</div>
                <div className="text-sm text-muted-foreground">
                  Slots totaux
                </div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {emptySlots}
                </div>
                <div className="text-sm text-muted-foreground">Slots vides</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {lowStockSlots}
                </div>
                <div className="text-sm text-muted-foreground">
                  Stock faible
                </div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {fullSlots}
                </div>
                <div className="text-sm text-muted-foreground">
                  Slots pleins
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleRestockAll}
                disabled={restockingAll || needsRestockSlots === 0}
                className="flex items-center gap-2"
              >
                {restockingAll ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Package className="w-4 h-4" />
                )}
                Ravitailler tout au maximum
                {needsRestockSlots > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {needsRestockSlots}
                  </Badge>
                )}
              </Button>
              <Button variant="outline">
                <History className="w-4 h-4 mr-2" />
                Historique des ravitaillements
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddSlotModalOpen(true)}
                disabled={totalSlots >= 6}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un slot
                {totalSlots >= 6 && (
                  <Badge variant="warning" className="ml-2">
                    Max
                  </Badge>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Grille des slots */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Slots de la machine
              {totalSlots > 0 && (
                <Badge variant="secondary">{totalSlots}/6 slots</Badge>
              )}
              {totalSlots === 0 && <Badge variant="outline">0/6 slots</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {slots && slots.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {slots
                  .sort((a, b) => a.slot_number - b.slot_number)
                  .map((slot, index) => (
                    <motion.div
                      key={slot.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                    >
                      <SlotCard
                        slot={slot}
                        onRestock={handleRestockSlot}
                        onEdit={handleEditSlot}
                        isLoading={restockingSlot === slot.id}
                      />
                    </motion.div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Aucun slot configuré
                </h3>
                <p className="text-muted-foreground mb-4">
                  Cette machine n'a aucun slot configuré pour le moment.
                </p>
                <Button onClick={() => setIsAddSlotModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un slot
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal d'ajout de slot */}
      <AddSlotModal
        isOpen={isAddSlotModalOpen}
        onClose={() => setIsAddSlotModalOpen(false)}
        machineId={machineId}
        onSlotAdded={() => {
          refetchSlots();
          // Optionnel: refetch machine pour mettre à jour les statistiques
        }}
      />
    </div>
  );
}
