"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  Eye,
  ShoppingCart,
  User,
  MapPin,
  Clock,
  Euro,
  QrCode,
  CheckCircle,
  XCircle,
  AlertCircle,
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


    customerEmail: "sophie.dubois@email.com",
    items: [{ name: "Chips Nature 45g", price: 1.8, quantity: 1 }],
    total: 1.8,
    machine: "Machine Campus A",
    location: "Bâtiment Sciences",
    status: "cancelled" as const,
    paymentMethod: "card",
    qrCode: "QR789123456",
    orderDate: "2024-01-15T13:15:00Z",
    pickupDate: null,
    expiresAt: null,
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
  const [orders] = useState([]);

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
          <Download className="h-4 w-4" />
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
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
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
              <AlertCircle className="h-8 w-8 text-yellow-500" />
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
              <CheckCircle className="h-8 w-8 text-green-500" />
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
              <Euro className="h-8 w-8 text-green-500" />
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
                          <User className="h-4 w-4" />
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
                          <MapPin className="h-4 w-4" />
                          <span>{order.machine}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {order.location}
                        </div>
                      </div>

                      {/* Timing */}
                      <div>
                        <div className="flex items-center gap-1 text-sm font-medium mb-1">
                          <Clock className="h-4 w-4" />
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
                            className={`text-xs mt-1 ${
                              timeRemaining === "Expirée"
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
                            <QrCode className="h-3 w-3" />
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
                        <Eye className="h-4 w-4" />
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
          <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune commande trouvée</h3>
          <p className="text-muted-foreground">
            Aucune commande ne correspond à vos critères de recherche.
          </p>
        </motion.div>
      )}
    </div>
  );
}
