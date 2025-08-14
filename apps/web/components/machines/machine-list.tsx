"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Filter,
  Plus,
  Edit,
  MapPin,
  Monitor,
  Wifi,
  WifiOff,
  Wrench,
  XCircle,
  Settings,
  TrendingUp,
  Package,
  Euro,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
} from "@/components/ui";
import { api } from "@/lib/trpc/client";

// Types pour les machines
type MachineStatus = "online" | "offline" | "maintenance" | "out_of_service";

interface MachineData {
  id: string;
  label: string;
  location: string;
  status: MachineStatus;
  last_update: string;
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

export function MachineList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Récupération des données via tRPC
  const {
    data: machines,
    isLoading,
    error,
    refetch,
  } = api.machines.getAllMachines.useQuery();

  // Fonction pour calculer des métriques simulées basées sur les données réelles
  const getMachineMetrics = (machine: MachineData) => {
    // Simulation de métriques basées sur l'ID de la machine
    const seed = machine.id.charCodeAt(machine.id.length - 1);
    return {
      stockLevel: Math.max(20, 90 - (seed % 70)),
      lastOrder: `${seed % 60} min`,
      revenue: Number((50 + (seed % 200)).toFixed(2)),
      totalProducts: 8 + (seed % 8),
      lowStockProducts: seed % 4,
      outOfStockProducts: seed % 3,
      ordersToday: 5 + (seed % 25),
      lastMaintenance: new Date(Date.now() - (seed % 30) * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      temperature: Number((3.5 + (seed % 20) / 10).toFixed(1)),
      connectivity: ["strong", "medium", "weak"][seed % 3],
    };
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Machines</h1>
            <p className="text-muted-foreground">
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
            <h1 className="text-3xl font-bold tracking-tight">Machines</h1>
            <p className="text-muted-foreground">
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
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const getConnectivityIcon = (connectivity: string | undefined) => {
    switch (connectivity) {
      case "strong":
        return <Wifi className="h-4 w-4 text-green-500" />;
      case "medium":
        return <Wifi className="h-4 w-4 text-yellow-500" />;
      case "weak":
        return <Wifi className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Machines</h1>
          <p className="text-muted-foreground">
            Surveillez et gérez vos machines de distribution
          </p>
        </div>
        <Button
          className="flex items-center gap-2"
          aria-label="Ajouter une nouvelle machine"
          title="Ajouter une nouvelle machine"
        >
          <Plus className="h-4 w-4" />
          Ajouter une machine
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une machine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  aria-label="Rechercher une machine par nom ou localisation"
                />
              </div>
            </div>
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
                variant={statusFilter === "maintenance" ? "primary" : "outline"}
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
          </div>
        </CardContent>
      </Card>

      {/* Machines Grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredMachines.map((machine, index) => {
          const statusInfo = statusConfig[machine.status];
          const StatusIcon = statusInfo.icon;
          const metrics = getMachineMetrics(machine);

          return (
            <motion.div
              key={machine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/machines/${machine.id}`} className="block">
                <Card
                  className="group hover:shadow-lg transition-all duration-200"
                  role="article"
                  aria-labelledby={`machine-title-${machine.id}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle
                          id={`machine-title-${machine.id}`}
                          className="text-lg mb-2"
                        >
                          {machine.label}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" aria-hidden="true" />
                          <span>{machine.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
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
                          <span
                            aria-label={`Connectivité: ${metrics.connectivity}`}
                          >
                            {getConnectivityIcon(metrics.connectivity)}
                          </span>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          aria-label={`Paramètres de ${machine.label}`}
                          title="Paramètres"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // TODO: Ouvrir les paramètres
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          aria-label={`Modifier ${machine.label}`}
                          title="Modifier"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // TODO: Ouvrir l'édition
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Revenue and Orders */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Euro
                          className="h-4 w-4 text-green-500"
                          aria-hidden="true"
                        />
                        <div>
                          <div className="text-muted-foreground">Revenus</div>
                          <div
                            className="font-semibold text-lg"
                            aria-label={`Revenus: ${metrics.revenue} euros`}
                          >
                            {metrics.revenue}€
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp
                          className="h-4 w-4 text-blue-500"
                          aria-hidden="true"
                        />
                        <div>
                          <div className="text-muted-foreground">Commandes</div>
                          <div
                            className="font-semibold text-lg"
                            aria-label={`Commandes aujourd'hui: ${metrics.ordersToday}`}
                          >
                            {metrics.ordersToday}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Stock global
                        </span>
                        <span
                          className={
                            metrics.stockLevel > 70
                              ? "text-green-600"
                              : metrics.stockLevel > 30
                                ? "text-yellow-600"
                                : "text-red-600"
                          }
                          aria-label={`Niveau de stock: ${metrics.stockLevel}%`}
                        >
                          {metrics.stockLevel}%
                        </span>
                      </div>
                      <div
                        className="w-full bg-muted rounded-full h-2"
                        role="progressbar"
                        aria-valuenow={metrics.stockLevel}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label="Niveau de stock global"
                      >
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            metrics.stockLevel > 70
                              ? "bg-green-500"
                              : metrics.stockLevel > 30
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${metrics.stockLevel}%` }}
                        />
                      </div>
                    </div>

                    {/* Product Stats */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-muted/50 rounded-lg">
                        <div
                          className="font-semibold"
                          aria-label={`Total produits: ${metrics.totalProducts}`}
                        >
                          {metrics.totalProducts}
                        </div>
                        <div className="text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                        <div
                          className="font-semibold text-yellow-700 dark:text-yellow-400"
                          aria-label={`Produits en stock faible: ${metrics.lowStockProducts}`}
                        >
                          {metrics.lowStockProducts}
                        </div>
                        <div className="text-yellow-600 dark:text-yellow-500">
                          Stock faible
                        </div>
                      </div>
                      <div className="text-center p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                        <div
                          className="font-semibold text-red-700 dark:text-red-400"
                          aria-label={`Produits en rupture: ${metrics.outOfStockProducts}`}
                        >
                          {metrics.outOfStockProducts}
                        </div>
                        <div className="text-red-600 dark:text-red-500">
                          Rupture
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                      <div>Dernière commande: {metrics.lastOrder}</div>
                      <div>Température: {metrics.temperature}°C</div>
                      <div>Maintenance: {metrics.lastMaintenance}</div>
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
          <Monitor
            className="h-12 w-12 text-muted-foreground mx-auto mb-4"
            aria-hidden="true"
          />
          <h3 className="text-lg font-medium mb-2">Aucune machine trouvée</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "Aucune machine ne correspond à vos critères de recherche."
              : "Aucune machine n'est configurée pour le moment."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button
              className="mt-4"
              aria-label="Ajouter votre première machine"
            >
              Ajouter une machine
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}
