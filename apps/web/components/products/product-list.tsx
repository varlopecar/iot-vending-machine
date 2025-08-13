"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Package,
  Euro,
  Tag,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
} from "@/components/ui";

// Mock data pour l'exemple
const mockProducts = [
  {
    id: "PROD-001",
    name: "Coca-Cola 33cl",
    category: "Boissons",
    price: 2.5,
    cost: 1.2,
    margin: 1.3,
    stock: 245,
    sold: 89,
    image: "/coca.png",
    status: "active",
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
    image: "/chips.png",
    status: "active",
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
    image: "/eau.png",
    status: "low_stock",
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
    image: "/kinder.png",
    status: "out_of_stock",
  },
];

const categories = ["Toutes", "Boissons", "Snacks", "Confiseries", "Sandwichs"];

export function ProductList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [products] = useState(mockProducts);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Toutes" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string, stock: number) => {
    if (status === "out_of_stock" || stock === 0) {
      return <Badge variant="destructive">Rupture</Badge>;
    }
    if (status === "low_stock" || stock < 100) {
      return <Badge variant="warning">Stock faible</Badge>;
    }
    return <Badge variant="success">En stock</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
          <p className="text-muted-foreground">
            Gérez votre catalogue de produits
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un produit
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    selectedCategory === category ? "primary" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">
                      {product.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {product.category}
                      </Badge>
                      {getStatusBadge(product.status, product.stock)}
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Prix de vente</div>
                    <div className="font-semibold text-lg">
                      {product.price.toFixed(2)}€
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Marge</div>
                    <div className="font-semibold text-lg text-green-600">
                      {product.margin.toFixed(2)}€
                    </div>
                  </div>
                </div>

                {/* Stock and Sales */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">Stock</div>
                      <div className="font-medium">{product.stock} unités</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Vendus</div>
                    <div className="font-medium">{product.sold} ce mois</div>
                  </div>
                </div>

                {/* Stock Level Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">
                      Niveau de stock
                    </span>
                    <span
                      className={
                        product.stock === 0
                          ? "text-red-600"
                          : product.stock < 100
                            ? "text-yellow-600"
                            : "text-green-600"
                      }
                    >
                      {product.stock > 0
                        ? product.stock < 100
                          ? "Faible"
                          : "Bon"
                        : "Vide"}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        product.stock === 0
                          ? "bg-red-500"
                          : product.stock < 100
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min((product.stock / 300) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucun produit trouvé</h3>
          <p className="text-muted-foreground">
            Aucun produit ne correspond à vos critères de recherche.
          </p>
        </motion.div>
      )}
    </div>
  );
}
