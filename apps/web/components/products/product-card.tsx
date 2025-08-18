"use client";

import React from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Tag } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@/components/ui";
import { formatCurrency } from "@/lib/utils/format";
import Image from "next/image";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  margin: number;
  stock: number;
  sold: number;
  image?: string;
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  index: number;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  index,
}: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className="hover:shadow-lg transition-all duration-200"
        role="article"
        aria-labelledby={`product-name-${product.id}`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle
                id={`product-name-${product.id}`}
                className="text-lg mb-1 line-clamp-1 cursor-help"
                title={product.name}
              >
                {product.name}
              </CardTitle>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  <Tag className="h-4 w-4 mr-1" />
                  {product.category}
                </Badge>
              </div>
            </div>
            <div className="flex gap-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onEdit(product)}
                aria-label={`Modifier le produit ${product.name}`}
                title="Modifier le produit"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={() => onDelete(product.id)}
                aria-label={`Supprimer le produit ${product.name}`}
                title="Supprimer le produit"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Image du produit */}
          <div className="relative h-32 w-full bg-light-tertiary dark:bg-dark-border rounded-lg overflow-hidden">
            <Image
              src="/assets/images/coca.png"
              alt={`Photo du produit ${product.name}`}
              width={200}
              height={128}
              className="object-contain w-full h-full"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
          </div>

          {/* Informations de prix */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-light-textSecondary dark:text-dark-textSecondary text-sm">
                Prix de vente
              </div>
              <div className="font-semibold text-lg">
                {formatCurrency(product.price)}
              </div>
            </div>
            <div>
              <div className="text-light-textSecondary dark:text-dark-textSecondary text-sm">
                Marge
              </div>
              <div className="font-semibold text-lg text-green-600">
                {formatCurrency(product.margin)}
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="text-left">
            <div className="text-light-textSecondary dark:text-dark-textSecondary text-sm">
              Vendus
            </div>
            <div className="font-medium text-lg">{product.sold} unités</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
