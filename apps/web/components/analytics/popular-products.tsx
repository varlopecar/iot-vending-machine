"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package } from "lucide-react";
import { PopularProduct } from "@/lib/types";

interface PopularProductsProps {
  products: PopularProduct[];
  isLoading?: boolean;
}

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
};

export function PopularProducts({ products, isLoading }: PopularProductsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-light-text dark:text-dark-text">
            <TrendingUp
              className="h-5 w-5 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
            Produits populaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="space-y-3"
            role="list"
            aria-label="Chargement des produits populaires"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-primary/50 rounded-lg animate-pulse"
                role="listitem"
                aria-hidden="true"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded"></div>
                  <div className="w-24 h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="flex gap-4">
                  <div className="w-16 h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
                  <div className="w-20 h-4 bg-gray-100 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-light-text dark:text-dark-text">
            <TrendingUp
              className="h-5 w-5 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
            Produits populaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="text-center text-light-textSecondary dark:text-dark-textSecondary py-8"
            role="status"
            aria-label="Aucun produit populaire"
          >
            <Package
              className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3"
              aria-hidden="true"
            />
            <p>Aucune vente ce mois-ci</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card role="region" aria-labelledby="popular-products-title">
      <CardHeader>
        <CardTitle
          id="popular-products-title"
          className="flex items-center gap-2 text-light-text dark:text-dark-text"
        >
          <TrendingUp
            className="h-5 w-5 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
          Produits populaires
          <span className="text-sm font-normal text-light-textSecondary dark:text-dark-textSecondary ml-2">
            - Mois en cours
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="space-y-3"
          role="list"
          aria-label="Liste des produits populaires"
        >
          {products.map((product, index) => (
            <div
              key={product.productId}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-primary/50 rounded-lg transition-colors"
              role="listitem"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-light-text dark:text-dark-text">
                    {product.productName}
                  </p>
                  <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                    {product.totalSold} vendue{product.totalSold > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-light-text dark:text-dark-text">
                  {formatCurrency(product.totalRevenueCents)}
                </p>
                <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  revenus
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
