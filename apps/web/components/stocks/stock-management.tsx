"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Minus,
  Package,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Monitor,
  RefreshCw,
  Download,
  Upload,
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
const mockStockItems = [
  {
    id: "STOCK-001",
    productId: "PROD-001",
    productName: "Coca-Cola 33cl",
    category: "Boissons",
    machineId: "MAC-001",
    machineName: "Machine Campus A",
    machineLocation: "Bâtiment Sciences",
    currentStock: 12,
    maxCapacity: 15,
    minThreshold: 5,
    lastRefill: "2024-01-10",
    avgConsumption: 8.5,
    daysRemaining: 1.4,
    status: "low_stock" as const,
    price: 2.5,
  },
  {
    id: "STOCK-002",
    productId: "PROD-002",
    productName: "Chips Nature 45g",
    category: "Snacks",
    machineId: "MAC-001",
    machineName: "Machine Campus A",
    machineLocation: "Bâtiment Sciences",
    currentStock: 0,
    maxCapacity: 10,
    minThreshold: 3,
    lastRefill: "2024-01-08",
    avgConsumption: 5.2,
    daysRemaining: 0,
    status: "out_of_stock" as const,
    price: 1.8,
  },
  {
    id: "STOCK-003",
    productId: "PROD-003",
    productName: "Eau Minérale 50cl",
    category: "Boissons",
    machineId: "MAC-002",
    machineName: "Machine Cafétéria",
    machineLocation: "Cafétéria principale",
    currentStock: 8,
    maxCapacity: 12,
    minThreshold: 4,
    lastRefill: "2024-01-12",
    avgConsumption: 6.8,
    daysRemaining: 1.2,
    status: "ok" as const,
    price: 1.5,
  },
];

const statusConfig = {
  out_of_stock: {
    label: "Rupture",
    variant: "destructive" as const,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    icon: XCircle,
  },
  low_stock: {
    label: "Stock faible",
    variant: "warning" as const,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    icon: AlertTriangle,
  },
  ok: {
    label: "En stock",
    variant: "success" as const,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    icon: Package,
  },
};

export function StockManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [machineFilter, setMachineFilter] = useState("all");
  const [stocks] = useState(mockStockItems);

  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.machineName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || stock.status === statusFilter;
    const matchesMachine =
      machineFilter === "all" || stock.machineId === machineFilter;
    return matchesSearch && matchesStatus && matchesMachine;
  });

  const totalItems = stocks.length;
  const outOfStockCount = stocks.filter(
    (s) => s.status === "out_of_stock"
  ).length;
  const lowStockCount = stocks.filter((s) => s.status === "low_stock").length;
  const okStockCount = stocks.filter((s) => s.status === "ok").length;

  const getStockPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const getUrgencyColor = (daysRemaining: number) => {
    if (daysRemaining <= 0) return "text-red-600";
    if (daysRemaining <= 1) return "text-orange-600";
    if (daysRemaining <= 2) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestion des stocks
          </h1>
          <p className="text-muted-foreground">
            Surveillez et gérez les niveaux de stock de toutes vos machines
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total articles</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En stock</p>
                <p className="text-2xl font-bold text-green-600">
                  {okStockCount}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock faible</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {lowStockCount}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ruptures</p>
                <p className="text-2xl font-bold text-red-600">
                  {outOfStockCount}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit ou une machine..."
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
                Tous
              </Button>
              <Button
                variant={
                  statusFilter === "out_of_stock" ? "primary" : "outline"
                }
                size="sm"
                onClick={() => setStatusFilter("out_of_stock")}
              >
                Ruptures
              </Button>
              <Button
                variant={statusFilter === "low_stock" ? "primary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("low_stock")}
              >
                Stock faible
              </Button>
              <Button
                variant={statusFilter === "ok" ? "primary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("ok")}
              >
                En stock
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Items */}
      <div className="space-y-4">
        {filteredStocks.map((stock, index) => {
          const statusInfo = statusConfig[stock.status];
          const StatusIcon = statusInfo.icon;
          const stockPercentage = getStockPercentage(
            stock.currentStock,
            stock.maxCapacity
          );

          return (
            <motion.div
              key={stock.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                      {/* Product Info */}
                      <div className="lg:col-span-2">
                        <h3 className="font-semibold text-lg mb-1">
                          {stock.productName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {stock.category}
                          </Badge>
                          <Badge
                            variant={statusInfo.variant}
                            className="text-xs"
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Machine Info */}
                      <div>
                        <div className="text-sm font-medium">
                          {stock.machineName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {stock.machineLocation}
                        </div>
                      </div>

                      {/* Stock Level */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {stock.currentStock}/{stock.maxCapacity}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {stockPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              stock.status === "out_of_stock"
                                ? "bg-red-500"
                                : stock.status === "low_stock"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{ width: `${stockPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Consumption & Forecast */}
                      <div>
                        <div className="text-sm font-medium">
                          {stock.avgConsumption}/jour
                        </div>
                        <div
                          className={`text-xs ${getUrgencyColor(stock.daysRemaining)}`}
                        >
                          {stock.daysRemaining > 0
                            ? `${stock.daysRemaining.toFixed(1)} jours restants`
                            : "Rupture immédiate"}
                        </div>
                      </div>

                      {/* Last Refill */}
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Dernier ravitaillement
                        </div>
                        <div className="text-sm font-medium">
                          {stock.lastRefill}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={stock.currentStock <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        disabled={stock.currentStock >= stock.maxCapacity}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={
                          stock.status === "out_of_stock"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className="ml-2"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Ravitailler
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredStocks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun article trouvé</h3>
          <p className="text-muted-foreground">
            Aucun article ne correspond à vos critères de recherche.
          </p>
        </motion.div>
      )}
    </div>
  );
}
