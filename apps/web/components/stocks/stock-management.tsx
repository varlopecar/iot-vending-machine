"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Search,
    Download,
    Package,
    AlertTriangle,
    TrendingDown,
    TrendingUp,
    RefreshCw,
    Plus,
    Eye,
} from "lucide-react";
import {
    Card,
    CardContent,
    Button,
    Input,
    Badge,
} from "@/components/ui";

// Mock data for demonstration
const mockStocks = [
    {
        id: "stock-001",
        machine_id: "machine-001",
        product_id: "product-001",
        quantity: 5,
        slot_number: 1,
        max_capacity: 20,
        low_threshold: 5,
        product_name: "Chips Nature 45g",
        product_price: 1.8,
        product_image_url: "/assets/images/chips.png",
        machine_name: "Machine Campus A",
        machine_location: "Bâtiment Sciences",
    },
    {
        id: "stock-002",
        machine_id: "machine-001",
        product_id: "product-002",
        quantity: 0,
        slot_number: 2,
        max_capacity: 15,
        low_threshold: 3,
        product_name: "Coca-Cola 33cl",
        product_price: 2.5,
        product_image_url: "/assets/images/coca.png",
        machine_name: "Machine Campus A",
        machine_location: "Bâtiment Sciences",
    },
    {
        id: "stock-003",
        machine_id: "machine-002",
        product_id: "product-003",
        quantity: 2,
        slot_number: 1,
        max_capacity: 25,
        low_threshold: 5,
        product_name: "Eau minérale 50cl",
        product_price: 1.2,
        product_image_url: "/assets/images/eau.png",
        machine_name: "Machine Cafétéria",
        machine_location: "RDC Bâtiment Principal",
    },
];

const getStockStatus = (quantity: number, lowThreshold: number, maxCapacity: number) => {
    if (quantity === 0) {
        return {
            status: "out_of_stock",
            label: "Rupture",
            variant: "destructive" as const,
            color: "text-red-600",
            bgColor: "bg-red-50",
        };
    } else if (quantity <= lowThreshold) {
        return {
            status: "low_stock",
            label: "Stock faible",
            variant: "warning" as const,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
        };
    } else if (quantity >= maxCapacity * 0.8) {
        return {
            status: "high_stock",
            label: "Stock élevé",
            variant: "success" as const,
            color: "text-green-600",
            bgColor: "bg-green-50",
        };
    } else {
        return {
            status: "normal",
            label: "Normal",
            variant: "secondary" as const,
            color: "text-gray-600",
            bgColor: "bg-gray-50",
        };
    }
};

export function StockManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [stocks] = useState(mockStocks);

    const filteredStocks = stocks.filter((stock) => {
        const stockStatus = getStockStatus(stock.quantity, stock.low_threshold, stock.max_capacity);
        const matchesSearch =
            stock.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stock.machine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stock.machine_location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || stockStatus.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalSlots = stocks.length;
    const outOfStockSlots = stocks.filter((s) => s.quantity === 0).length;
    const lowStockSlots = stocks.filter((s) => s.quantity > 0 && s.quantity <= s.low_threshold).length;
    const totalProducts = stocks.reduce((sum, s) => sum + s.quantity, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestion des Stocks</h1>
                    <p className="text-muted-foreground">
                        Consultez et gérez les stocks de toutes les machines
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Actualiser
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Exporter
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total emplacements</p>
                                <p className="text-2xl font-bold">{totalSlots}</p>
                            </div>
                            <Package className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">En rupture</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {outOfStockSlots}
                                </p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Stock faible</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {lowStockSlots}
                                </p>
                            </div>
                            <TrendingDown className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total produits</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {totalProducts}
                                </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-500" />
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
                                    placeholder="Rechercher par produit, machine ou emplacement..."
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
                                variant={statusFilter === "out_of_stock" ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter("out_of_stock")}
                            >
                                Rupture
                            </Button>
                            <Button
                                variant={statusFilter === "low_stock" ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter("low_stock")}
                            >
                                Stock faible
                            </Button>
                            <Button
                                variant={statusFilter === "normal" ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter("normal")}
                            >
                                Normal
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stock List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredStocks.map((stock, index) => {
                    const stockStatus = getStockStatus(stock.quantity, stock.low_threshold, stock.max_capacity);
                    const fillPercentage = (stock.quantity / stock.max_capacity) * 100;

                    return (
                        <motion.div
                            key={stock.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-md transition-all duration-200">
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {/* Product Header */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-gray-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-sm">{stock.product_name}</h3>
                                                    <p className="text-xs text-muted-foreground">
                                                        Slot {stock.slot_number} • {stock.product_price}€
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={stockStatus.variant} className="text-xs">
                                                {stockStatus.label}
                                            </Badge>
                                        </div>

                                        {/* Machine Info */}
                                        <div className="text-sm">
                                            <p className="font-medium">{stock.machine_name}</p>
                                            <p className="text-muted-foreground text-xs">{stock.machine_location}</p>
                                        </div>

                                        {/* Stock Level */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Stock actuel</span>
                                                <span className="font-medium">
                                                    {stock.quantity} / {stock.max_capacity}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all duration-300 ${stock.quantity === 0
                                                        ? "bg-red-500"
                                                        : stock.quantity <= stock.low_threshold
                                                            ? "bg-orange-500"
                                                            : "bg-green-500"
                                                        }`}
                                                    style={{ width: `${Math.max(fillPercentage, 2)}%` }}
                                                />
                                            </div>
                                            {stock.quantity <= stock.low_threshold && stock.quantity > 0 && (
                                                <p className="text-xs text-orange-600">
                                                    Seuil d&apos;alerte: {stock.low_threshold} unités
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 h-8 text-xs"
                                            >
                                                <Eye className="h-3 w-3 mr-1" />
                                                Voir
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 h-8 text-xs"
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Restockage
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
                    <h3 className="text-lg font-medium mb-2">Aucun stock trouvé</h3>
                    <p className="text-muted-foreground">
                        Aucun stock ne correspond à vos critères de recherche.
                    </p>
                </motion.div>
            )}
        </div>
    );
}
