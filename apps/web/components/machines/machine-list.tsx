"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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

// Mock data pour l'exemple
const mockMachines = [
  {
    id: "MAC-001",
    name: "Machine Campus A",
    location: "Bâtiment Sciences",
    address: "123 Avenue des Sciences, Campus",
    status: "online" as const,
    stockLevel: 85,
    lastOrder: "2 min",
    revenue: 145.5,
    totalProducts: 12,
    lowStockProducts: 2,
    outOfStockProducts: 0,
    ordersToday: 23,
    lastMaintenance: "2024-01-15",
    temperature: 4.2,
    connectivity: "strong",
  },
  {
    id: "MAC-002",
    name: "Machine Cafétéria",
    location: "Cafétéria principale",
    address: "456 Place de la Cafétéria, Campus",
    status: "maintenance" as const,
    stockLevel: 65,
    lastOrder: "1h 23min",
    revenue: 98.75,
    totalProducts: 10,
    lowStockProducts: 4,
    outOfStockProducts: 1,
    ordersToday: 15,
    lastMaintenance: "2024-01-10",
    temperature: 3.8,
    connectivity: "medium",
  },
  {
    id: "MAC-003",
    name: "Machine Bibliothèque",
    location: "Bibliothèque universitaire",
    address: "789 Rue de la Connaissance, Campus",
    status: "offline" as const,
    stockLevel: 45,
    lastOrder: "3h 12min",
    revenue: 76.25,
    totalProducts: 8,
    lowStockProducts: 3,
    outOfStockProducts: 2,
    ordersToday: 8,
    lastMaintenance: "2024-01-08",
    temperature: 5.1,
    connectivity: "weak",
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

export function MachineList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [machines] = useState(mockMachines);

  const filteredMachines = machines.filter((machine) => {
    const matchesSearch =
      machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || machine.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getConnectivityIcon = (connectivity: string) => {
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
        <Button className="flex items-center gap-2">
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
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === "all" ? "primary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                Toutes
              </Button>
              <Button
                variant={statusFilter === "online" ? "primary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("online")}
              >
                En ligne
              </Button>
              <Button
                variant={statusFilter === "maintenance" ? "primary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("maintenance")}
              >
                Maintenance
              </Button>
              <Button
                variant={statusFilter === "offline" ? "primary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("offline")}
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

          return (
            <motion.div
              key={machine.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {machine.name}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>{machine.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusInfo.variant} className="text-xs">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                        {getConnectivityIcon(machine.connectivity)}
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Revenue and Orders */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="text-muted-foreground">Revenus</div>
                        <div className="font-semibold text-lg">
                          {machine.revenue.toFixed(2)}€
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="text-muted-foreground">Commandes</div>
                        <div className="font-semibold text-lg">
                          {machine.ordersToday}
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

                  {/* Product Stats */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <div className="font-semibold">
                        {machine.totalProducts}
                      </div>
                      <div className="text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                      <div className="font-semibold text-yellow-700 dark:text-yellow-400">
                        {machine.lowStockProducts}
                      </div>
                      <div className="text-yellow-600 dark:text-yellow-500">
                        Stock faible
                      </div>
                    </div>
                    <div className="text-center p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <div className="font-semibold text-red-700 dark:text-red-400">
                        {machine.outOfStockProducts}
                      </div>
                      <div className="text-red-600 dark:text-red-500">
                        Rupture
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                    <div>Dernière commande: {machine.lastOrder}</div>
                    <div>Température: {machine.temperature}°C</div>
                    <div>Maintenance: {machine.lastMaintenance}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredMachines.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune machine trouvée</h3>
          <p className="text-muted-foreground">
            Aucune machine ne correspond à vos critères de recherche.
          </p>
        </motion.div>
      )}
    </div>
  );
}
