"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  MapPin,
  Wifi,
  WifiOff,
  Wrench,
  XCircle,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
} from "../ui";
import { trpc } from "../../lib/trpc/client";
import { AddMachineModal } from "./add-machine-modal";
import { MachineAlertBadge } from "./machine-alert-badge";

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
  const router = useRouter();

  // Récupération des données via tRPC
  const {
    data: machines,
    isLoading,
    error,
    refetch,
  } = trpc.machines.getAllMachines.useQuery();

  // Stats agrégées (revenus, stocks)
  const { data: stats } = trpc.machines.getAllMachineStats.useQuery();

  // Récupération des alertes par machine
  const { data: alertsSummary } =
    trpc.alerts.getAlertsSummaryByMachine.useQuery();

  // Récupération du résumé des alertes pour le bandeau
  const { data: alertsGlobalSummary } = trpc.alerts.getAlertsSummary.useQuery();

  const utils = trpc.useUtils();

  const filteredMachines =
    machines?.filter((machine) => {
      const matchesSearch =
        machine.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || machine.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  const getMachineStats = (machineId: string) => {
    return stats?.find((stat) => stat.machine_id === machineId);
  };

  const getMachineAlerts = (machineId: string) => {
    return (
      alertsSummary?.filter((alert) => alert.machine_id === machineId) || []
    );
  };

  const handleAddMachine = () => {
    setIsAddMachineOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div
          className="text-light-error dark:text-dark-error mb-4"
          role="alert"
        >
          Erreur lors du chargement des machines: {error.message}
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text">
            Machines
          </h2>
          <p className="text-light-textSecondary dark:text-dark-textSecondary">
            Gérez vos distributeurs automatiques ({filteredMachines.length}{" "}
            machines)
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          <Button
            onClick={handleAddMachine}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter une machine
          </Button>
        </div>
      </div>

      {/* Bandeau d'alerte pour machines non configurées */}
      {alertsGlobalSummary?.incompleteAlerts &&
        alertsGlobalSummary.incompleteAlerts > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle
                className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800 mb-1">
                  Machines non configurées
                </h3>
                <p className="text-sm text-yellow-700 mb-3">
                  <strong>{alertsGlobalSummary.incompleteAlerts}</strong>{" "}
                  machine{alertsGlobalSummary.incompleteAlerts > 1 ? "s" : ""}{" "}
                  nécessite
                  {alertsGlobalSummary.incompleteAlerts > 1 ? "nt" : ""} une
                  configuration complète avant d&apos;être mises en service.
                </p>
                <div className="flex flex-wrap gap-2">
                  {alertsGlobalSummary.alertsByMachine
                    ?.filter((alert) => alert.type === "INCOMPLETE")
                    .map((alert) => {
                      const machine = machines?.find(
                        (m) => m.id === alert.machine_id
                      );
                      return machine ? (
                        <Link
                          key={alert.machine_id}
                          href={`/machines/${alert.machine_id}`}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full hover:bg-yellow-200 transition-colors"
                        >
                          <span>{machine.label}</span>
                          <span className="text-yellow-600">→</span>
                        </Link>
                      ) : null;
                    })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-light-textSecondary dark:text-dark-textSecondary" />
          <Input
            type="text"
            placeholder="Rechercher par nom ou localisation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["all", "online", "offline", "maintenance", "out_of_service"].map(
            (status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "primary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status === "all"
                  ? "Toutes"
                  : statusConfig[status as keyof typeof statusConfig]?.label ||
                    status}
              </Button>
            )
          )}
        </div>
      </div>

      {/* Liste des machines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMachines.map((machine, index) => {
          const machineStats = getMachineStats(machine.id);
          const machineAlerts = getMachineAlerts(machine.id);

          return (
            <motion.div
              key={machine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/machines/${machine.id}`}>
                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col space-y-3">
                      {/* Nom de la machine */}
                      <CardTitle className="text-lg">{machine.label}</CardTitle>

                      {/* Localisation */}
                      <div className="flex items-center gap-2 text-sm text-light-textSecondary dark:text-dark-textSecondary">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{machine.location}</span>
                      </div>

                      {/* Status et alertes */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={
                            statusConfig[
                              machine.status as keyof typeof statusConfig
                            ]?.variant
                          }
                        >
                          {
                            statusConfig[
                              machine.status as keyof typeof statusConfig
                            ]?.label
                          }
                        </Badge>
                        {/* Badges d'alerte */}
                        {machineAlerts.length > 0 && (
                          <>
                            {machineAlerts.slice(0, 2).map((alert) => (
                              <MachineAlertBadge
                                key={alert.id}
                                alertType={
                                  alert.type as
                                    | "CRITICAL"
                                    | "LOW_STOCK"
                                    | "INCOMPLETE"
                                    | "MACHINE_OFFLINE"
                                    | "MAINTENANCE_REQUIRED"
                                    | null
                                }
                              />
                            ))}
                            {machineAlerts.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{machineAlerts.length - 2}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Statistiques */}
                    {machineStats && (
                      <div className="space-y-4">
                        {/* Revenus */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <div className="text-green-500">€</div>
                            <div>
                              <div className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                                Revenus 30j
                              </div>
                              <div className="font-medium text-green-800 dark:text-green-300">
                                {Math.round(
                                  machineStats.revenueLast30dCents / 100
                                )}
                                €
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                            <div>
                              <div className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                                Cmd 30j
                              </div>
                              <div className="font-medium text-blue-800 dark:text-blue-300">
                                {machineStats.ordersLast30d}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Stock global en pourcentage */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                              Stock global
                            </span>
                            <span className="text-xs font-medium text-light-text dark:text-dark-text">
                              {Math.round(machineStats.stockPercentage)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                machineStats.stockPercentage >= 70
                                  ? "bg-green-500"
                                  : machineStats.stockPercentage >= 30
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                              style={{
                                width: `${Math.min(machineStats.stockPercentage, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        {/* Slots */}
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="bg-blue-50 dark:bg-blue-900/20 text-center p-2 rounded">
                            <div className="font-bold text-blue-700 dark:text-blue-400">
                              {machineStats.totalSlots}
                            </div>
                            <div className="text-xs text-blue-800 dark:text-blue-300">
                              Slots
                            </div>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/20 text-center p-2 rounded">
                            <div className="font-bold text-orange-700 dark:text-orange-400">
                              {machineStats.lowStockCount}
                            </div>
                            <div className="text-xs text-orange-800 dark:text-orange-300">
                              Stock faible
                            </div>
                          </div>
                          <div className="bg-red-50 dark:bg-red-900/20 text-center p-2 rounded">
                            <div className="font-bold text-red-700 dark:text-red-400">
                              {machineStats.outOfStockCount}
                            </div>
                            <div className="text-xs text-red-800 dark:text-red-300">
                              Rupture
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Informations en bas */}
                    <div className="space-y-1 pt-3 border-t border-light-border dark:border-dark-border">
                      {machineStats && (
                        <>
                          <div className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                            Total revenus:{" "}
                            {Math.round(machineStats.revenueTotalCents / 100)}€
                          </div>
                          <div className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                            Stock: {machineStats.currentStockQuantity}/
                            {machineStats.maxCapacityTotal} produits
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Modal d'ajout */}
      <AddMachineModal
        isOpen={isAddMachineOpen}
        onClose={() => setIsAddMachineOpen(false)}
        onSuccess={() => {
          utils.machines.getAllMachines.invalidate();
        }}
        onRedirect={(machineId) => {
          router.push(`/machines/${machineId}`);
        }}
      />
    </div>
  );
}
