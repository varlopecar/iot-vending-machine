"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ShoppingCartIcon,
  UserIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyEuroIcon,
  QrCodeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardContent,
  Button,
  Input,
  Badge,
} from "@/components/ui";

// Types for order data
interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  machine: string;
  location: string;
  status: "pending" | "completed" | "expired" | "cancelled";
  paymentMethod: "card" | "cash" | "mobile";
  qrCode: string | null;
  orderDate: string;
  pickupDate: string | null;
  expiresAt: string | null;
}

// Mock data for development
const mockOrders: Order[] = [
  {
    id: "ORD-003",
    customerName: "Sophie Dubois",
    customerEmail: "sophie.dubois@email.com",
    items: [{ name: "Chips Nature 45g", price: 1.8, quantity: 1 }],
    total: 1.8,
    machine: "Machine Campus A",
    location: "Bâtiment Sciences",
    status: "cancelled",
    paymentMethod: "card",
    qrCode: "QR789123456",
    orderDate: "2024-01-15T13:15:00Z",
    pickupDate: null,
    expiresAt: null,
  },
  {
    id: "ORD-001",
    customerName: "Jean Martin",
    customerEmail: "jean.martin@email.com",
    items: [
      { name: "Coca-Cola 33cl", price: 2.5, quantity: 1 },
      { name: "Sandwich Jambon", price: 4.2, quantity: 1 }
    ],
    total: 6.7,
    machine: "Machine Campus B",
    location: "Hall Principal",
    status: "completed",
    paymentMethod: "card",
    qrCode: "QR123456789",
    orderDate: "2024-01-15T10:30:00Z",
    pickupDate: "2024-01-15T10:45:00Z",
    expiresAt: null,
  },
  {
    id: "ORD-002",
    customerName: "Marie Durant",
    customerEmail: "marie.durant@email.com",
    items: [{ name: "Eau Evian 50cl", price: 1.5, quantity: 2 }],
    total: 3.0,
    machine: "Machine Cafétéria",
    location: "Restaurant Universitaire",
    status: "pending",
    paymentMethod: "mobile",
    qrCode: "QR987654321",
    orderDate: "2024-01-15T12:00:00Z",
    pickupDate: null,
    expiresAt: "2024-01-15T14:00:00Z",
  },
];

const statusConfig = {
  pending: {
    label: "En attente",
    variant: "warning" as const,
    color: "text-yellow-600",
    icon: AlertCircle,
  },
  completed: {
    label: "Récupérée",
    variant: "success" as const,
    color: "text-green-600",
    icon: CheckCircle,
  },
  expired: {
    label: "Expirée",
    variant: "destructive" as const,
    color: "text-red-600",
    icon: XCircle,
  },
  cancelled: {
    label: "Annulée",
    variant: "destructive" as const,
    color: "text-red-600",
    icon: XCircle,
  },
};

const paymentMethods = {
  card: "Carte bancaire",
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
  loyalty_points: "Points fidélité",
};

export function OrderList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders] = useState<Order[]>(mockOrders);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return "Expirée";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}min`;
    return `${minutes}min`;
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
          <p className="text-muted-foreground">
            Consultez et gérez toutes les commandes
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <ArrowDownTrayIcon className="h-4 w-4" />
          Exporter
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total commandes</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
              <ShoppingCartIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingOrders}
                </p>
              </div>
              <ExclamationCircleIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Récupérées</p>
                <p className="text-2xl font-bold text-green-600">
                  {completedOrders}
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalRevenue.toFixed(2)}€
                </p>
              </div>
              <CurrencyEuroIcon className="h-8 w-8 text-green-500" />
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
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par ID, nom ou email..."
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
                variant={statusFilter === "pending" ? "primary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("pending")}
              >
                En attente
              </Button>
              <Button
                variant={statusFilter === "completed" ? "primary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("completed")}
              >
                Récupérées
              </Button>
              <Button
                variant={statusFilter === "expired" ? "primary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("expired")}
              >
                Expirées
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order, index) => {
          const statusInfo = statusConfig[order.status];
          const StatusIcon = statusInfo.icon;
          const timeRemaining = getTimeRemaining(order.expiresAt);

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-6 gap-4">
                      {/* Order Info */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{order.id}</h3>
                          <Badge
                            variant={statusInfo.variant}
                            className="text-xs"
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                          <UserIcon className="h-4 w-4" />
                          <span>{order.customerName}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.customerEmail}
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <div className="text-sm font-medium mb-1">Articles</div>
                        <div className="space-y-1">
                          {order.items.map((item, i) => (
                            <div
                              key={i}
                              className="text-xs text-muted-foreground"
                            >
                              {item.quantity}x {item.name}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Machine */}
                      <div>
                        <div className="flex items-center gap-1 text-sm font-medium mb-1">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{order.machine}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.location}
                        </div>
                      </div>

                      {/* Timing */}
                      <div>
                        <div className="flex items-center gap-1 text-sm font-medium mb-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>Commande</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(order.orderDate)}
                        </div>
                        {order.pickupDate && (
                          <div className="text-xs text-green-600 mt-1">
                            Récupérée: {formatDate(order.pickupDate)}
                          </div>
                        )}
                        {timeRemaining && order.status === "pending" && (
                          <div
                            className={`text-xs mt-1 ${timeRemaining === "Expirée"
                              ? "text-red-600"
                              : timeRemaining.includes("min") &&
                                !timeRemaining.includes("h")
                                ? "text-orange-600"
                                : "text-yellow-600"
                              }`}
                          >
                            Expire dans: {timeRemaining}
                          </div>
                        )}
                      </div>

                      {/* Payment & Total */}
                      <div>
                        <div className="text-sm font-medium mb-1">
                          {order.total.toFixed(2)}€
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {
                            paymentMethods[
                            order.paymentMethod as keyof typeof paymentMethods
                            ]
                          }
                        </div>
                        {order.qrCode && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <QrCodeIcon className="h-3 w-3" />
                            <span>{order.qrCode}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <ShoppingCartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune commande trouvée</h3>
          <p className="text-muted-foreground">
            Aucune commande ne correspond à vos critères de recherche.
          </p>
        </motion.div>
      )}
    </div>
  );
}
