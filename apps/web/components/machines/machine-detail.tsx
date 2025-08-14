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
import { EmptySlotCard } from "./empty-slot-card";
import { AddSlotModal } from "./add-slot-modal";
import { EditSlotModal } from "./edit-slot-modal";
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
  const [restockingAll, setRestockingAll] = useState(false);
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [isEditSlotModalOpen, setIsEditSlotModalOpen] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

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
    setSelectedSlotId(slotId);
    setIsEditSlotModalOpen(true);
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

  // Calcul des slots non-configurés
  const configuredSlots = totalSlots;
  const unConfiguredSlots = 6 - configuredSlots;
  const isFullyConfigured = configuredSlots === 6;

  // Statut directement depuis la BDD
  const statusInfo = statusConfig[machine.status as MachineStatus];
  const StatusIcon = statusInfo.icon;

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

      {/* Alerte de configuration incomplète */}
      {!isFullyConfigured && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800 mb-1">
                Configuration incomplète
              </h3>
              <p className="text-sm text-yellow-700">
                Cette machine n'est pas entièrement configurée.
                <strong>
                  {" "}
                  {unConfiguredSlots} slot{unConfiguredSlots > 1 ? "s" : ""}{" "}
                  restant{unConfiguredSlots > 1 ? "s" : ""}
                </strong>{" "}
                à configurer sur 6 total. La machine est actuellement hors
                service jusqu'à ce que tous les slots soient configurés.
              </p>
            </div>
          </div>
        </motion.div>
      )}

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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Slots configurés */}
              {slots &&
                slots
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
                        onEdit={handleEditSlot}
                        onRestockComplete={() => refetchSlots()}
                      />
                    </motion.div>
                  ))}

              {/* Card "Ajouter un produit" (seulement si pas complètement configuré) */}
              {unConfiguredSlots > 0 && (
                <motion.div
                  key="add-product-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.4 + configuredSlots * 0.05,
                  }}
                >
                  <EmptySlotCard
                    onAddSlot={() => setIsAddSlotModalOpen(true)}
                  />
                </motion.div>
              )}
            </div>

            {/* Message si aucun slot du tout */}
            {totalSlots === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Cliquez sur "Ajouter un produit" ci-dessus pour commencer la
                  configuration.
                </p>
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
          // Mettre à jour aussi la machine pour refléter ONLINE si 6/6
          refetchMachine();
        }}
      />

      {/* Modal d'édition de slot */}
      <EditSlotModal
        isOpen={isEditSlotModalOpen}
        onClose={() => setIsEditSlotModalOpen(false)}
        slot={
          selectedSlotId
            ? (slots || []).find((s) => s.id === selectedSlotId)
              ? {
                  id: (slots || []).find((s) => s.id === selectedSlotId)!.id,
                  product_id: (slots || []).find(
                    (s) => s.id === selectedSlotId
                  )!.product_id,
                  product_name: (slots || []).find(
                    (s) => s.id === selectedSlotId
                  )!.product_name,
                  quantity: (slots || []).find((s) => s.id === selectedSlotId)!
                    .quantity,
                  max_capacity: (slots || []).find(
                    (s) => s.id === selectedSlotId
                  )!.max_capacity,
                  slot_number: (slots || []).find(
                    (s) => s.id === selectedSlotId
                  )!.slot_number,
                  machine_id: (slots || []).find(
                    (s) => s.id === selectedSlotId
                  )!.machine_id,
                }
              : null
            : null
        }
        onSaved={() => refetchSlots()}
      />
    </div>
  );
}
