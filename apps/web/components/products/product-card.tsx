"use client";

import React from "react";
import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, Button, Badge } from "@/components/ui";
import { formatCurrency } from "@/lib/utils/format";
import Image from "next/image";

// Function to get appropriate image for each product
const getProductImage = (productName: string, category: string): string => {
  const name = productName.toLowerCase();

  if (name.includes("chips") || name.includes("energy")) {
    return "/assets/images/chips.png";
  }
  if (name.includes("coca") || name.includes("cola")) {
    return "/assets/images/coca.png";
  }
  if (name.includes("kinder") || name.includes("bueno")) {
    return "/assets/images/kinder.png";
  }
  if (name.includes("water") || name.includes("eau")) {
    return "/assets/images/eau.png";
  }

  // Fallback based on category
  switch (category.toLowerCase()) {
    case "snacks":
      return "/assets/images/chips.png";
    case "boissons":
      return "/assets/images/coca.png";
    case "confiseries":
      return "/assets/images/kinder.png";
    default:
      return "/assets/images/coca.png";
  }
};

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    purchase_price: number;
    image_url?: string;
    soldCount: number;
  };
  onEdit: (product: {
    id: string;
    name: string;
    category: string;
    price: number;
    purchase_price: number;
    image_url?: string;
    soldCount: number;
  }) => void;
  onDelete: (productId: string) => void;
  index: number;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  index,
}: ProductCardProps) {
  const handleEdit = () => {
    onEdit(product);
  };

  const handleDelete = () => {
    onDelete(product.id);
  };

  const margin = product.price - product.purchase_price;
  const marginPercentage = ((margin / product.price) * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="p-0">
          <div className="relative h-48 bg-gray-100">
            <Image
              src={getProductImage(product.name, product.category)}
              alt={product.name}
              fill
              className="object-contain p-2"
            />
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-xs">
                {product.category}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg text-light-text dark:text-dark-text truncate">
                {product.name}
              </h3>
              <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                Vendu: {product.soldCount} fois
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  Prix de vente:
                </span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(product.price)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  Prix d&apos;achat:
                </span>
                <span className="text-light-text dark:text-dark-text">
                  {formatCurrency(product.purchase_price)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  Marge:
                </span>
                <span className="font-medium text-blue-600">
                  {formatCurrency(margin)} ({marginPercentage}%)
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleEdit}
                variant="outline"
                size="sm"
                className="flex-1 flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
              <Button
                onClick={handleDelete}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
