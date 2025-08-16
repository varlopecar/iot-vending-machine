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
import { EditProductModal } from "./edit-product-modal";
import { api } from "@/lib/trpc/client";

// Interface pour les données produits avec métriques calculées
interface ProductWithMetrics extends Product {
  cost: number;
  margin: number;
  stock: number;
  sold: number;
  category: string;
  allergens_list?: string[];
  nutritional?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    serving?: string;
  };
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

// Fonction pour calculer des métriques basées sur les données réelles du backend
const getProductMetrics = (product: any): ProductWithMetrics => {
  const seed = product.id.charCodeAt(product.id.length - 1);
  const price = Number(product.price);
  const purchasePrice = Number(product.purchase_price ?? price * 0.4);

  return {
    id: product.id,
    name: product.name,
    price,
    image: getLocalImagePath(product.name), // Utilise l'image locale
    category: product.category ?? generateCategory(product.name),
    cost: Number(purchasePrice.toFixed(2)),
    margin: Number((price - purchasePrice).toFixed(2)),
    stock: Math.max(0, 150 - (seed % 120)), // Toujours simulé pour le stock
    sold: product.soldCount || 0, // Utilise les vraies données de vente du backend
    allergens_list: product.allergens_list || [],
    nutritional: product.nutritional || undefined,
  };
};

export function ProductList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithMetrics | null>(null);

  // Récupération des données via tRPC
  const {
    data: rawProducts,
    isLoading,
    error,
    refetch,
  } = api.products.getAllProductsWithStats.useQuery();

  // Mutations
  const createProduct = api.products.createProduct.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddModalOpen(false);
    },
  });

  const deleteProduct = api.products.deleteProduct.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const updateProduct = api.products.updateProduct.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

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
  const handleAddProduct = async (
    newProductData: Omit<ProductWithMetrics, "id" | "sold"> & {
      allergens?: string;
      calories?: string;
      protein?: string;
      carbs?: string;
      fat?: string;
      serving?: string;
    }
  ) => {
    // Préparer les allergènes
    const allergens_list = newProductData.allergens
      ? newProductData.allergens
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a.length > 0)
      : undefined;

    // Préparer les valeurs nutritionnelles
    const nutritional =
      newProductData.calories ||
      newProductData.protein ||
      newProductData.carbs ||
      newProductData.fat ||
      newProductData.serving
        ? {
            calories: newProductData.calories
              ? parseFloat(newProductData.calories)
              : undefined,
            protein: newProductData.protein
              ? parseFloat(newProductData.protein)
              : undefined,
            carbs: newProductData.carbs
              ? parseFloat(newProductData.carbs)
              : undefined,
            fat: newProductData.fat
              ? parseFloat(newProductData.fat)
              : undefined,
            serving: newProductData.serving || undefined,
          }
        : undefined;

    await createProduct.mutateAsync({
      name: newProductData.name,
      category: newProductData.category,
      price: newProductData.price,
      purchase_price: newProductData.cost,
      allergens_list,
      nutritional,
    });
  };

  // Handle editing product
  const handleEditProduct = (product: ProductWithMetrics) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  // Handle updating product
  const handleUpdateProduct = async (
    productId: string,
    updateData: {
      name?: string;
      category?: string;
      price?: number;
      purchase_price?: number;
      allergens?: string;
      calories?: string;
      protein?: string;
      carbs?: string;
      fat?: string;
      serving?: string;
    }
  ) => {
    // Préparer les allergènes
    const allergens_list = updateData.allergens
      ? updateData.allergens
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a.length > 0)
      : undefined;

    // Préparer les valeurs nutritionnelles
    const nutritional =
      updateData.calories ||
      updateData.protein ||
      updateData.carbs ||
      updateData.fat ||
      updateData.serving
        ? {
            calories: updateData.calories
              ? parseFloat(updateData.calories)
              : undefined,
            protein: updateData.protein
              ? parseFloat(updateData.protein)
              : undefined,
            carbs: updateData.carbs ? parseFloat(updateData.carbs) : undefined,
            fat: updateData.fat ? parseFloat(updateData.fat) : undefined,
            serving: updateData.serving || undefined,
          }
        : undefined;

    try {
      await updateProduct.mutateAsync({
        id: productId,
        data: {
          name: updateData.name,
          category: updateData.category,
          price: updateData.price,
          purchase_price: updateData.purchase_price,
          allergens_list,
          nutritional,
        },
      });
      setIsEditModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      
      alert("Erreur lors de la modification du produit. Veuillez réessayer.");
    }
  };

  // Handle deleting product
  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await deleteProduct.mutateAsync({ id: productId });
      } catch (error) {

        alert("Erreur lors de la suppression du produit. Veuillez réessayer.");
      }
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

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        onEditProduct={handleUpdateProduct}
        product={selectedProduct}
      />
    </div>
  );
}
