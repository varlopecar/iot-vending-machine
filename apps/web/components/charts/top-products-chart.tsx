"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Package, TrendingUp } from "lucide-react";



const categoryColors = {
  Boissons: "bg-blue-500",
  Snacks: "bg-yellow-500",
  Confiseries: "bg-pink-500",
  Sandwichs: "bg-green-500",
};

export function TopProductsChart() {
  const maxSold = Math.max(...topProductsData.map((p) => p.sold));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Produits les plus vendus
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Top 5 des produits cette semaine
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProductsData.map((product, index) => (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                {index + 1}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{product.name}</h4>
                  <div className="text-sm font-semibold">
                    {product.sold} vendus
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground">
                    {product.category}
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      categoryColors[
                        product.category as keyof typeof categoryColors
                      ]
                    }`}
                  />
                  <span className="text-xs text-green-600 font-medium">
                    {product.revenue.toFixed(2)}€
                  </span>
                </div>

                <div className="w-full bg-muted rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(product.sold / maxSold) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                    className={`h-2 rounded-full ${
                      categoryColors[
                        product.category as keyof typeof categoryColors
                      ]
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
