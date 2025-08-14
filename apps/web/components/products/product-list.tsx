"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
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

// Mock data avec images et status
const initialMockProducts: Product[] = [
  {
    id: "PROD-001",
    name: "Coca-Cola 33cl",
    category: "Boissons",
    price: 2.5,
    cost: 1.2,
    margin: 1.3,
    stock: 245,
    sold: 89,
    image: "/assets/images/coca.png",
  },
  {
    id: "PROD-002",
    name: "Chips Nature 45g",
    category: "Snacks",
    price: 1.8,
    cost: 0.9,
    margin: 0.9,
    stock: 156,
    sold: 67,
    image: "/assets/images/chips.png",
  },
  {
    id: "PROD-003",
    name: "Eau Minérale 50cl",
    category: "Boissons",
    price: 1.5,
    cost: 0.6,
    margin: 0.9,
    stock: 89,
    sold: 134,
    image: "/assets/images/eau.png",
  },
  {
    id: "PROD-004",
    name: "Kinder Bueno",
    category: "Confiseries",
    price: 2.2,
    cost: 1.1,
    margin: 1.1,
    stock: 0,
    sold: 45,
    image: "/assets/images/kinder.png",
  },
];

const categories = [
  "Toutes",
  "Boissons",
  "Snacks",
  "Confiseries",
  "Sandwichs",
  "Autres",
];

export function ProductList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [products, setProducts] = useState<Product[]>(initialMockProducts);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Toutes" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Generate new product ID
  const generateProductId = () => {
    const maxId = products.reduce((max, product) => {
      const num = parseInt(product.id.split("-")[1] || "0");
      return num > max ? num : max;
    }, 0);
    return `PROD-${String(maxId + 1).padStart(3, "0")}`;
  };

  // Handle adding new product
  const handleAddProduct = (newProductData: Omit<Product, "id" | "sold">) => {
    const newProduct: Product = {
      ...newProductData,
      id: generateProductId(),
      sold: 0,
    };

    setProducts((prev) => [newProduct, ...prev]);
  };

  // Handle editing product
  const handleEditProduct = (product: Product) => {
    // TODO: Implement edit functionality
    console.log("Edit product:", product);
  };

  // Handle deleting product
  const handleDeleteProduct = (productId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
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
