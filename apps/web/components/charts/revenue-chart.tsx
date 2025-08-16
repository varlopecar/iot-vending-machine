"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { TrendingUp, Euro } from "lucide-react";


const revenueData = [
  { day: "Lun", revenue: 145.5, orders: 23 },
  { day: "Mar", revenue: 189.75, orders: 31 },
  { day: "Mer", revenue: 234.2, orders: 38 },
  { day: "Jeu", revenue: 198.6, orders: 28 },
  { day: "Ven", revenue: 312.4, orders: 45 },
  { day: "Sam", revenue: 287.9, orders: 41 },
  { day: "Dim", revenue: 156.3, orders: 22 },
];

export function RevenueChart() {
  const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const avgRevenue = totalRevenue / revenueData.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Euro className="h-5 w-5" />
          Revenus hebdomadaires
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Revenus par jour de la semaine dernière
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-xl font-bold">
                {totalRevenue.toFixed(2)}€
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Moyenne/jour</div>
              <div className="text-xl font-bold">{avgRevenue.toFixed(2)}€</div>
            </div>
          </div>

          {/* Chart */}
          <div className="space-y-2">
            {revenueData.map((item, index) => (
              <motion.div
                key={item.day}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="w-12 text-sm font-medium">{item.day}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>{item.revenue.toFixed(2)}€</span>
                    <span className="text-muted-foreground">
                      {item.orders} commandes
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(item.revenue / maxRevenue) * 100}%`,
                      }}
                      transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                      className="h-2 bg-primary rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
