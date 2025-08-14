"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui";
import { ProductCard, Product } from "./product-card";
import { ProductFilters } from "./product-filters";
import { AddProductModal } from "./add-product-modal";
import { api } from "@/lib/trpc/client";

// Interface pour les données produits avec métriques calculées
interface ProductWithMetrics extends Product {
  cost: number;
  margin: number;
  stock: number;
  sold: number;
  category: string;
}

// Fonction pour générer des catégories basées sur les noms de produits
const generateCategory = (productName: string): string => {
  const name = productName.toLowerCase();
  if (
    name.includes("coca") ||
    name.includes("eau") ||
    name.includes("sprite") ||
    name.includes("jus")
  ) {
    return "Boissons";
  }
  if (
    name.includes("chips") ||
    name.includes("crackers") ||
    name.includes("biscuit")
  ) {
    return "Snacks";
  }
  if (
    name.includes("chocolat") ||
    name.includes("bonbon") ||
    name.includes("kinder") ||
    name.includes("haribo")
  ) {
    return "Confiseries";
  }
  if (name.includes("sandwich") || name.includes("wrap")) {
    return "Sandwichs";
  }
  return "Autres";
};

// Fonction pour mapper les produits aux images locales
const getLocalImagePath = (productName: string): string => {
  const name = productName.toLowerCase();

  // Mapping précis basé sur les noms de produits
  if (name.includes("coca") || name.includes("cola")) {
    return "/assets/images/coca.png";
  }
  if (
    name.includes("chips") ||
    name.includes("crisp") ||
    name.includes("potato")
  ) {
    return "/assets/images/chips.png";
  }
  if (
    name.includes("eau") ||
    name.includes("water") ||
    name.includes("minérale")
  ) {
    return "/assets/images/eau.png";
  }
  if (
    name.includes("kinder") ||
    name.includes("bueno") ||
    name.includes("chocolat")
  ) {
    return "/assets/images/kinder.png";
  }

  // Images par catégorie comme fallback
  const category = generateCategory(productName);
  switch (category) {
    case "Boissons":
      return "/assets/images/coca.png";
    case "Snacks":
      return "/assets/images/chips.png";
    case "Confiseries":
      return "/assets/images/kinder.png";
    default:
      return "/assets/images/coca.png"; // Image par défaut
  }
};

// Fonction pour calculer des métriques simulées basées sur les données réelles
const getProductMetrics = (product: any): ProductWithMetrics => {
  const seed = product.id.charCodeAt(product.id.length - 1);
  const price = Number(product.price);

  return {
    id: product.id,
    name: product.name,
    price,
    image: getLocalImagePath(product.name), // Utilise l'image locale
    category: generateCategory(product.name),
    cost: Number((price * 0.4 + (seed % 50) / 100).toFixed(2)),
    margin: Number((price * 0.5 + (seed % 30) / 100).toFixed(2)),
    stock: Math.max(0, 150 - (seed % 120)),
    sold: 20 + (seed % 100),
  };
};

export function ProductList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Récupération des données via tRPC
  const {
    data: rawProducts,
    isLoading,
    error,
    refetch,
  } = api.products.getAllProducts.useQuery();

  // Conversion des données avec métriques
  const products = rawProducts?.map(getProductMetrics) || [];

  // Génération dynamique des catégories
  const categories = [
    "Toutes",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Toutes" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
            <p className="text-light-textSecondary dark:text-dark-textSecondary">
              Gérez votre catalogue de produits
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
            role="status"
            aria-label="Chargement des produits"
          ></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
            <p className="text-light-textSecondary dark:text-dark-textSecondary">
              Gérez votre catalogue de produits
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4" role="alert">
            Erreur lors du chargement des produits: {error.message}
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            aria-label="Réessayer le chargement des produits"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  // Handle adding new product
  const handleAddProduct = (
    newProductData: Omit<ProductWithMetrics, "id" | "sold">
  ) => {
    // TODO: Implement with tRPC mutation
    console.log("Add product:", newProductData);
  };

  // Handle editing product
  const handleEditProduct = (product: ProductWithMetrics) => {
    // TODO: Implement edit functionality with tRPC
    console.log("Edit product:", product);
  };

  // Handle deleting product
  const handleDeleteProduct = (productId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      // TODO: Implement with tRPC mutation
      console.log("Delete product:", productId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
          <p className="text-light-textSecondary dark:text-dark-textSecondary">
            Gérez votre catalogue de produits
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
          aria-label="Ajouter un nouveau produit"
        >
          <Plus className="h-4 w-4" />
          Ajouter un produit
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ProductFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />
      </motion.div>

      {/* Products Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {filteredProducts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
                index={index}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-light-textSecondary dark:text-dark-textSecondary text-center">
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-lg font-medium mb-2">
                  Aucun produit trouvé
                </h3>
                <p className="text-sm">
                  {searchTerm || selectedCategory !== "Toutes"
                    ? "Aucun produit ne correspond à vos critères de recherche."
                    : "Commencez par ajouter votre premier produit."}
                </p>
                {!searchTerm && selectedCategory === "Toutes" && (
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="mt-4"
                    aria-label="Ajouter votre premier produit"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un produit
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProduct={handleAddProduct}
      />
    </div>
  );
}
