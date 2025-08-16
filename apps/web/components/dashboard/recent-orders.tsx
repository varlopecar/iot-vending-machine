"use client";

import { motion } from "framer-motion";
import { Clock, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "@/components/ui";
import { formatCurrency } from "@/lib/utils/format";


const recentOrders = [
  {
    id: "ORD-001",
    customer: "Jean Dupont",
    items: 2,
    total: 4.5,
    machine: "Machine Campus A",
    location: "Bâtiment Sciences",
    status: "completed" as const,
    time: "2 min",
  },
  {
    id: "ORD-002",
    customer: "Marie Martin",
    items: 1,
    total: 2.0,
    machine: "Machine Cafétéria",
    location: "Cafétéria principale",
    status: "pending" as const,
    time: "5 min",
  },
  {
    id: "ORD-003",
    customer: "Pierre Bernard",
    items: 3,
    total: 6.75,
    machine: "Machine Bibliothèque",
    location: "Bibliothèque universitaire",
    status: "picked_up" as const,
    time: "12 min",
  },
];

const statusVariants = {
  completed: { variant: "success" as const, label: "Récupérée" },
  pending: { variant: "warning" as const, label: "En attente" },
  picked_up: { variant: "default" as const, label: "Récupérée" },
};

export function RecentOrders() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Commandes récentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentOrders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{order.id}</span>
                <Badge
                  variant={statusVariants[order.status].variant}
                  className="text-xs"
                >
                  {statusVariants[order.status].label}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mb-1">
                {order.customer} • {order.items} article
                {order.items > 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {order.machine} - {order.location}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-sm">
                {formatCurrency(order.total)}
              </div>
              <div className="text-xs text-muted-foreground">
                il y a {order.time}
              </div>
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center pt-2"
        >
          <button className="text-sm text-primary hover:underline">
            Voir toutes les commandes
          </button>
        </motion.div>
      </CardContent>
    </Card>
  );
}
