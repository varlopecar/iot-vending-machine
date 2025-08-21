"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  Button,
} from "@/components/ui";
import { ProductCard } from "./product-card";
import { ProductFilters } from "./product-filters";
import { AddProductModal } from "./add-product-modal";
import { EditProductModal } from "./edit-product-modal";
import { trpc } from "@/lib/trpc/client";

// Fonction pour générer des catégories uniques à partir des produits
const generateCategories = (products: any[]) => {
  const categories = new Set<string>();
  products?.forEach((product) => {
    if (product.category) {
      categories.add(product.category);
    }
  });
  return Array.from(categories);
};

export function ProductList() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products, isLoading, refetch } = trpc.products.getAllProductsWithStats.useQuery();
  const utils = trpc.useUtils();

  const deleteMutation = trpc.products.deleteProduct.useMutation({
    onSuccess: () => {
      utils.products.getAllProductsWithStats.invalidate();
    },
  });

  const categories = generateCategories(products || []);

  const filteredProducts = products?.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  const handleDelete = (productId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      deleteMutation.mutate({ id: productId });
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
  };

  const handleAddProduct = () => {
    setIsAddModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-600">
            Gérez votre catalogue de produits ({filteredProducts.length} produits)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          <Button
            onClick={handleAddProduct}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter un produit
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <ProductFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Liste des produits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
              index={index}
            />
          </motion.div>
        ))}
      </div>

      {/* Modals */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          utils.products.getAllProductsWithStats.invalidate();
        }}
      />

      <EditProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        onSuccess={() => {
          setEditingProduct(null);
          utils.products.getAllProductsWithStats.invalidate();
        }}
      />
    </div>
  );
}
