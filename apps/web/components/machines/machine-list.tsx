"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MapPinIcon,
  ComputerDesktopIcon,
  ChartBarIcon,
  CurrencyEuroIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
} from "../ui";
import { api } from "../../lib/trpc/client";
import { AddMachineModal } from "./add-machine-modal";
import { MachineAlertBadge } from "./machine-alert-badge";

// MachineData dérivé directement des retours tRPC

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

export function MachineList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);
  // Revenus: affichage 30j par défaut; total en bas de carte

  // Récupération des données via tRPC
  const {
    data: machines,
    isLoading,
    error,
    refetch,
  } = api.machines.getAllMachines.useQuery();

  // Stats agrégées (revenus, stocks)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: stats } = (api as any).machines.getAllMachineStats.useQuery();

  // Récupération des alertes par machine
  const { data: alertsSummary } =
    api.alerts.getAlertsSummaryByMachine.useQuery();

  type MachineStat = {
    machine_id: string;
    totalSlots: number;
    lowStockCount: number;
    outOfStockCount: number;
    revenueTotalCents: number;
    revenueLast30dCents: number;
    ordersLast30d: number;
    currentStockQuantity: number;
    maxCapacityTotal: number;
    stockPercentage: number;
  };

  const filteredMachines =
    machines?.filter((machine) => {
      const matchesSearch =
        machine.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || machine.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  // Calculer les machines incomplètes via les stats (moins de 6 slots configurés)
  const statsById = new Map(
    ((stats as MachineStat[] | undefined) || []).map((s) => [s.machine_id, s])
  );
  const incompleteMachines =
    machines?.filter((m) => (statsById.get(m.id)?.totalSlots || 0) < 6) || [];
  const incompleteCount = incompleteMachines.length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-light-text dark:text-dark-text">
              Machines
            </h2>
            <p className="text-light-text dark:text-dark-textSecondary">
              Surveillez et gérez vos machines de distribution
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
            role="status"
            aria-label="Chargement des machines"
          ></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-light-text dark:text-dark-text">
              Machines
            </h2>
            <p className="text-light-text dark:text-dark-textSecondary">
              Surveillez et gérez vos machines de distribution
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4" role="alert">
            Erreur lors du chargement des machines: {error.message}
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            aria-label="Réessayer le chargement des machines"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  // Icône connectivité simulée retirée

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-light-text dark:text-dark-text">
            Machines
          </h2>
          <p className="text-light-text dark:text-dark-textSecondary">
            Surveillez et gérez vos machines de distribution
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          aria-label="Ajouter une nouvelle machine"
          title="Ajouter une nouvelle machine"
          onClick={() => setIsAddMachineOpen(true)}
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter une machine
        </Button>
      </div>

      {/* Alerte pour les machines incomplètes */}
      {incompleteCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <ExclamationTriangleIcon
              className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800 mb-1">
                {incompleteCount} machine{incompleteCount > 1 ? "s" : ""}{" "}
                nécessite{incompleteCount > 1 ? "nt" : ""} une configuration
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                Ces machines ne sont pas entièrement configurées et sont
                actuellement hors service. Chaque machine doit avoir 6 slots
                configurés pour être opérationnelle.
              </p>
              <div className="flex flex-wrap gap-2">
                {incompleteMachines.slice(0, 3).map((machine) => (
                  <Link key={machine.id} href={`/machines/${machine.id}`}>
                    <Badge
                      variant="outline"
                      className="hover:bg-yellow-100 cursor-pointer text-amber-900 border-yellow-300 px-3"
                    >
                      {machine.label}
                    </Badge>
                  </Link>
                ))}
                {incompleteCount > 3 && (
                  <Badge
                    variant="outline"
                    className="text-amber-900 border-yellow-300 px-3"
                  >
                    +{incompleteCount - 3} autre
                    {incompleteCount - 3 > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-light-text dark:text-dark-textSecondary"
                  aria-hidden="true"
                />
                <Input
                  placeholder="Rechercher une machine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  aria-label="Rechercher une machine par nom ou localisation"
                />
              </div>
            </div>
            <div className="flex gap-4 flex-wrap items-center">
              <div
                className="flex gap-2 flex-wrap"
                role="group"
                aria-label="Filtres par statut"
              >
                <Button
                  variant={statusFilter === "all" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                  aria-pressed={statusFilter === "all"}
                  aria-label="Afficher toutes les machines"
                >
                  Toutes
                </Button>
                <Button
                  variant={statusFilter === "online" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("online")}
                  aria-pressed={statusFilter === "online"}
                  aria-label="Afficher uniquement les machines en ligne"
                >
                  En ligne
                </Button>
                <Button
                  variant={
                    statusFilter === "maintenance" ? "primary" : "outline"
                  }
                  size="sm"
                  onClick={() => setStatusFilter("maintenance")}
                  aria-pressed={statusFilter === "maintenance"}
                  aria-label="Afficher uniquement les machines en maintenance"
                >
                  Maintenance
                </Button>
                <Button
                  variant={statusFilter === "offline" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("offline")}
                  aria-pressed={statusFilter === "offline"}
                  aria-label="Afficher uniquement les machines hors ligne"
                >
                  Hors ligne
                </Button>
              </div>

              {/* Pas de filtre revenus, 30j par défaut */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Machines Grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredMachines.map((machine, index) => {
          // Récupérer l'alerte pour cette machine
          const machineAlert = alertsSummary?.find(
            (alert) => alert.machine_id === machine.id
          );

          // Le badge principal affiche toujours le statut de la machine
          const statusInfo = statusConfig[machine.status];
          const StatusIcon = statusInfo.icon;
          const stat = (stats as MachineStat[] | undefined)?.find(
            (s) => s.machine_id === machine.id
          );
          const revenueTotal = (stat?.revenueTotalCents || 0) / 100;
          const revenue30d = (stat?.revenueLast30dCents || 0) / 100;
          const revenueValue = revenue30d;
          const revenueLabel = "Revenus 30j";
          const orders30d = stat?.ordersLast30d || 0;
          const stockLevel = stat?.stockPercentage || 0;

          return (
            <motion.div
              key={machine.id}
              className="h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/machines/${machine.id}`} className="block h-full">
                <Card
                  className="group hover:shadow-lg transition-all duration-200 h-full min-h-80 flex flex-col overflow-hidden"
                  role="article"
                  aria-labelledby={`machine-title-${machine.id}`}
                >
                  {/* Badge in-card au lieu d'un header */}
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle
                          id={`machine-title-${machine.id}`}
                          className="text-lg mb-2 text-light-text dark:text-dark-text"
                        >
                          {machine.label}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-sm text-light-text dark:text-dark-textSecondary mb-2">
                          <MapPinIcon className="h-4 w-4" aria-hidden="true" />
                          <span>{machine.location}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant={statusInfo.variant}
                            className="text-xs"
                            aria-label={`Statut de la machine: ${statusInfo.label}`}
                          >
                            <StatusIcon
                              className="h-3 w-3 mr-1"
                              aria-hidden="true"
                            />
                            {statusInfo.label}
                          </Badge>
                          <MachineAlertBadge
                            alertType={
                              machineAlert?.type as
                              | "CRITICAL"
                              | "LOW_STOCK"
                              | "INCOMPLETE"
                              | null
                            }
                          />
                        </div>
                        {/* pas d'info connectivité réelle pour l'instant */}
                      </div>
                      {/* Icônes de carte supprimées selon demande */}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-grow">
                    {/* Revenue and Orders */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CurrencyEuroIcon
                          className="h-4 w-4 text-green-500"
                          aria-hidden="true"
                        />
                        <div>
                          <div className="text-light-text dark:text-dark-textSecondary">
                            {revenueLabel}
                          </div>
                          <div
                            className="font-semibold text-lg text-light-text dark:text-dark-text"
                            aria-label={`${revenueLabel}: ${revenueValue} euros`}
                          >
                            {revenueValue.toFixed(2)}€
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ChartBarIcon
                          className="h-4 w-4 text-blue-500"
                          aria-hidden="true"
                        />
                        <div>
                          <div className="text-light-text dark:text-dark-textSecondary">
                            Cmd 30j
                          </div>
                          <div
                            className="font-semibold text-lg text-light-text dark:text-dark-text"
                            aria-label={`Commandes sur 30 jours: ${orders30d}`}
                          >
                            {orders30d}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-light-text dark:text-dark-textSecondary">
                          Stock global
                        </span>
                        <span
                          className={`font-bold ${stockLevel > 70
                            ? "text-green-800 dark:text-green-300"
                            : stockLevel > 30
                              ? "text-yellow-800 dark:text-yellow-300"
                              : "text-red-800 dark:text-red-300"
                            }`}
                          aria-label={`Niveau de stock: ${Math.round(stockLevel)}%`}
                        >
                          {Math.round(stockLevel)}%
                        </span>
                      </div>
                      <div
                        className="w-full bg-muted rounded-full h-2"
                        role="progressbar"
                        aria-valuenow={Math.round(stockLevel)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Niveau de stock global"
                      >
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${stockLevel > 70
                            ? "bg-green-500"
                            : stockLevel > 30
                              ? "bg-yellow-500"
                              : "bg-red-500"
                            }`}
                          style={{ width: `${stockLevel}%` }}
                        />
                      </div>
                    </div>

                    {/* Product Stats */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div
                          className="font-semibold text-gray-800 dark:text-gray-100"
                          aria-label={`Slots configurés: ${stat?.totalSlots ?? 0}`}
                        >
                          {stat?.totalSlots ?? 0}
                        </div>
                        <div className="text-gray-700 dark:text-gray-300">
                          Slots
                        </div>
                      </div>
                      <div className="text-center p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                        <div
                          className="font-semibold text-orange-800 dark:text-orange-200"
                          aria-label={`Slots faible stock: ${stat?.lowStockCount ?? 0}`}
                        >
                          {stat?.lowStockCount ?? 0}
                        </div>
                        <div className="text-orange-700 dark:text-orange-300">
                          Stock faible
                        </div>
                      </div>
                      <div className="text-center p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                        <div
                          className="font-semibold text-red-800 dark:text-red-200"
                          aria-label={`Slots vides: ${stat?.outOfStockCount ?? 0}`}
                        >
                          {stat?.outOfStockCount ?? 0}
                        </div>
                        <div className="text-red-700 dark:text-red-300">
                          Rupture
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="text-xs text-light-text dark:text-dark-textSecondary space-y-1 pt-2 border-t">
                      <div>Total revenus: {revenueTotal.toFixed(2)}€</div>
                      {stat && (
                        <div>
                          Stock: {stat.currentStockQuantity}/
                          {stat.maxCapacityTotal} produits
                        </div>
                      )}
                      <div>
                        Dernière mise à jour:{" "}
                        {new Date(machine.last_update).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {filteredMachines.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
          role="status"
          aria-live="polite"
        >
          <ComputerDesktopIcon
            className="h-12 w-12 text-light-text dark:text-dark-textSecondary mx-auto mb-4"
            aria-hidden="true"
          />
          <h3 className="text-lg font-medium mb-2 text-light-text dark:text-dark-text">
            Aucune machine trouvée
          </h3>
          <p className="text-light-text dark:text-dark-textSecondary">
            {searchTerm || statusFilter !== "all"
              ? "Aucune machine ne correspond à vos critères de recherche."
              : "Aucune machine n'est configurée pour le moment."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button
              className="mt-4"
              aria-label="Ajouter votre première machine"
              onClick={() => setIsAddMachineOpen(true)}
            >
              Ajouter une machine
            </Button>
          )}
        </motion.div>
      )}

      <AddMachineModal
        isOpen={isAddMachineOpen}
        onClose={() => setIsAddMachineOpen(false)}
        onCreated={() => {
          refetch();
        }}
      />
    </div>
  );
}
