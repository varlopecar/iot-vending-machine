"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Monitor, TrendingUp, TrendingDown } from "lucide-react";


const machinePerformanceData = [
  {
    name: "Machine Campus A",
    location: "Bâtiment Sciences",
    revenue: 1245.5,
    orders: 189,
    uptime: 98.5,
    growth: 12.3,
    avgOrderValue: 6.59,
  },
  {
    name: "Machine Cafétéria",
    location: "Cafétéria principale",
    revenue: 987.3,
    orders: 143,
    uptime: 95.2,
    growth: -5.7,
    avgOrderValue: 6.9,
  },
  {
    name: "Machine Bibliothèque",
    location: "Bibliothèque universitaire",
    revenue: 756.8,
    orders: 124,
    uptime: 92.1,
    growth: 8.9,
    avgOrderValue: 6.1,
  },
  {
    name: "Machine Sport",
    location: "Centre sportif",
    revenue: 1089.4,
    orders: 167,
    uptime: 99.1,
    growth: 15.6,
    avgOrderValue: 6.52,
  },
];

export function MachinePerformance() {
  const maxRevenue = Math.max(...machinePerformanceData.map((m) => m.revenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Performance des machines
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Analyse comparative des performances
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {machinePerformanceData.map((machine, index) => (
            <motion.div
              key={machine.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg border bg-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-lg">{machine.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {machine.location}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {machine.growth > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      machine.growth > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {machine.growth > 0 ? "+" : ""}
                    {machine.growth.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-xs text-muted-foreground">Revenus</div>
                  <div className="text-lg font-bold">
                    {machine.revenue.toFixed(2)}€
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Commandes</div>
                  <div className="text-lg font-bold">{machine.orders}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    Disponibilité
                  </div>
                  <div className="text-lg font-bold">
                    {machine.uptime.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    Panier moyen
                  </div>
                  <div className="text-lg font-bold">
                    {machine.avgOrderValue.toFixed(2)}€
                  </div>
                </div>
              </div>

              {/* Revenue Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">
                    Revenus comparés
                  </span>
                  <span>
                    {((machine.revenue / maxRevenue) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(machine.revenue / maxRevenue) * 100}%`,
                    }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                    className="h-2 bg-primary rounded-full"
                  />
                </div>
              </div>

              {/* Uptime Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Disponibilité</span>
                  <span>{machine.uptime.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${machine.uptime}%` }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                    className={`h-2 rounded-full ${
                      machine.uptime >= 98
                        ? "bg-green-500"
                        : machine.uptime >= 95
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
