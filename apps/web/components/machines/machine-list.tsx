"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Plus,
  MapPin,
  Monitor,
  Wifi,
  WifiOff,
  Wrench,
  XCircle,
  TrendingUp,
  Euro,
  RefreshCw,
  AlertTriangle,
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
  const { data: alertsSummary } = trpc.alerts.getAlertsSummaryByMachine.useQuery();

  const utils = trpc.useUtils();

  const filteredMachines =
    machines?.filter((machine) => {
      const matchesSearch =
        machine.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        machine.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || machine.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  const getMachineStats = (machineId: string) => {
    return stats?.find((stat) => stat.machine_id === machineId);
  };

  const getMachineAlerts = (machineId: string) => {
    return alertsSummary?.filter((alert) => alert.machine_id === machineId) || [];
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
        <div className="text-red-600 mb-4" role="alert">
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
          <h1 className="text-2xl font-bold text-gray-900">Machines</h1>
          <p className="text-gray-600">
            Gérez vos distributeurs automatiques ({filteredMachines.length} machines)
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          <Button onClick={handleAddMachine} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Ajouter une machine
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher par nom ou localisation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["all", "online", "offline", "maintenance", "out_of_service"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "primary" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === "all" ? "Toutes" : statusConfig[status as keyof typeof statusConfig]?.label || status}
            </Button>
          ))}
        </div>
      </div>

      {/* Liste des machines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMachines.map((machine, index) => {
          const machineStats = getMachineStats(machine.id);
          const machineAlerts = getMachineAlerts(machine.id);
          const StatusIcon = statusConfig[machine.status as keyof typeof statusConfig]?.icon || Monitor;

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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{machine.label}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {machine.location}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-5 w-5 ${statusConfig[machine.status as keyof typeof statusConfig]?.color}`} />
                        <Badge variant={statusConfig[machine.status as keyof typeof statusConfig]?.variant}>
                          {statusConfig[machine.status as keyof typeof statusConfig]?.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Alertes */}
                    {machineAlerts.length > 0 && (
                      <div className="flex gap-1">
                        {machineAlerts.slice(0, 3).map((alert) => (
                          <MachineAlertBadge
                            key={alert.id}
                            alertType={alert.type as
                              | "CRITICAL"
                              | "LOW_STOCK"
                              | "INCOMPLETE"
                              | "MACHINE_OFFLINE"
                              | "MAINTENANCE_REQUIRED"
                              | null}
                          />
                        ))}
                        {machineAlerts.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{machineAlerts.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Statistiques */}
                    {machineStats && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <div>
                            <div className="font-medium">
                              {machineStats.revenueLast30dCents / 100}€
                            </div>
                            <div className="text-xs text-gray-500">30j</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Euro className="h-4 w-4 text-blue-500" />
                          <div>
                            <div className="font-medium">
                              {machineStats.revenueTotalCents / 100}€
                            </div>
                            <div className="text-xs text-gray-500">Total</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-purple-500" />
                          <div>
                            <div className="font-medium">{machineStats.totalSlots}</div>
                            <div className="text-xs text-gray-500">Emplacements</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <div>
                            <div className="font-medium">{machineStats.lowStockCount}</div>
                            <div className="text-xs text-gray-500">Stock faible</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dernière mise à jour */}
                    <div className="text-xs text-gray-500">
                      Dernière mise à jour: {new Date(machine.last_update).toLocaleString()}
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
          setIsAddMachineOpen(false);
          utils.machines.getAllMachines.invalidate();
        }}
      />
    </div>
  );
}
