"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CubeIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
} from "@/components/ui";

// Mock data for development
const mockStockData = [
  {
    id: "1",
    machineId: "MACH-001",
    machineName: "Machine Campus A",
    location: "Bâtiment Sciences",
    totalSlots: 30,
    filledSlots: 18,
    emptySlots: 12,
    lowStockSlots: 4,
    lastRestocked: "2024-01-15T10:30:00Z",
    status: "active" as const,
  },
  {
    id: "2",
    machineId: "MACH-002",
    machineName: "Machine Cafétéria",
    location: "Restaurant Universitaire",
    totalSlots: 24,
    filledSlots: 20,
    emptySlots: 2,
    lowStockSlots: 2,
    lastRestocked: "2024-01-14T14:15:00Z",
    status: "active" as const,
  },
  {
    id: "3",
    machineId: "MACH-003",
    machineName: "Machine Bibliothèque",
    location: "Hall d'accueil",
    totalSlots: 20,
    filledSlots: 8,
    emptySlots: 8,
    lowStockSlots: 4,
    lastRestocked: "2024-01-13T09:00:00Z",
    status: "maintenance" as const,
  },
];

const statusConfig = {
  active: {
    label: "Actif",
    variant: "success" as const,
    color: "text-green-600",
  },
  maintenance: {
    label: "Maintenance",
    variant: "warning" as const,
    color: "text-yellow-600",
  },
  inactive: {
    label: "Inactif",
    variant: "destructive" as const,
    color: "text-red-600",
  },
};

export function StockManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filteredMachines = mockStockData.filter((machine) => {
    const matchesSearch =
      machine.machineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      machine.machineId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "low-stock" && machine.lowStockSlots > 0) ||
      (selectedFilter === "empty" && machine.emptySlots > 0) ||
      (selectedFilter === "maintenance" && machine.status === "maintenance");

    return matchesSearch && matchesFilter;
  });

  const totalMachines = mockStockData.length;
  const activeMachines = mockStockData.filter(m => m.status === "active").length;
  const totalLowStock = mockStockData.reduce((sum, m) => sum + m.lowStockSlots, 0);
  const totalEmpty = mockStockData.reduce((sum, m) => sum + m.emptySlots, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestion des Stocks
          </h1>
          <p className="text-gray-600 mt-1">
            Surveillez et gérez l'inventaire de vos machines
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button size="sm">
            <PlusIcon className="w-4 h-4 mr-2" />
            Réapprovisionner
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Machines
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalMachines}
                </p>
              </div>
              <CubeIcon className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Machines Actives
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {activeMachines}
                </p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Stock Faible
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {totalLowStock}
                </p>
              </div>
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Emplacements Vides
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {totalEmpty}
                </p>
              </div>
              <CubeIcon className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Machines et Inventaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher par nom, lieu ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === "all" ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("all")}
              >
                Tous
              </Button>
              <Button
                variant={selectedFilter === "low-stock" ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("low-stock")}
              >
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                Stock Faible
              </Button>
              <Button
                variant={selectedFilter === "empty" ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("empty")}
              >
                Vides
              </Button>
              <Button
                variant={selectedFilter === "maintenance" ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("maintenance")}
              >
                Maintenance
              </Button>
            </div>
          </div>

          {/* Machine List */}
          <div className="space-y-4">
            {filteredMachines.map((machine, index) => (
              <motion.div
                key={machine.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {machine.machineName}
                          </h3>
                          <Badge variant={statusConfig[machine.status].variant}>
                            {statusConfig[machine.status].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {machine.location} • {machine.machineId}
                        </p>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-1">
                            <CubeIcon className="w-4 h-4 text-green-600" />
                            <span>{machine.filledSlots} remplis</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                            <span>{machine.lowStockSlots} stock faible</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CubeIcon className="w-4 h-4 text-red-600" />
                            <span>{machine.emptySlots} vides</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-sm">
                          <p className="text-gray-600">Dernier réapprovisionnement</p>
                          <p className="font-medium">
                            {new Date(machine.lastRestocked).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Gérer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredMachines.length === 0 && (
            <div className="text-center py-12">
              <CubeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Aucune machine trouvée pour les critères sélectionnés.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
