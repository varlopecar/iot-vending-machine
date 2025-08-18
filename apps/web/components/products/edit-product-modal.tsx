"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Package } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";
import { Product } from "./product-card";

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

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditProduct: (
    productId: string,
    product: {
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
  ) => void;
  product: ProductWithMetrics | null;
}

const categories = ["Boissons", "Snacks", "Confiseries", "Sandwichs", "Autres"];

export function EditProductModal({
  isOpen,
  onClose,
  onEditProduct,
  product,
}: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: categories[0],
    price: "",
    cost: "",
    image: "",
    allergens: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    serving: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with product data
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || "",
        category: product.category || categories[0],
        price: product.price?.toString() || "",
        cost: product.cost?.toString() || "",
        image: product.image || "",
        allergens: product.allergens_list?.join(", ") || "",
        calories: product.nutritional?.calories?.toString() || "",
        protein: product.nutritional?.protein?.toString() || "",
        carbs: product.nutritional?.carbs?.toString() || "",
        fat: product.nutritional?.fat?.toString() || "",
        serving: product.nutritional?.serving || "",
      });
    }
  }, [product, isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom du produit est requis";
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      newErrors.price = "Le prix de vente doit être un nombre positif";
    }

    const cost = parseFloat(formData.cost);
    if (!formData.cost || isNaN(cost) || cost <= 0) {
      newErrors.cost = "Le prix d&apos;achat doit être un nombre positif";
    }

    // Check if cost is greater than price
    if (!newErrors.price && !newErrors.cost && cost >= price) {
      newErrors.cost =
        "Le prix d&apos;achat doit être inférieur au prix de vente";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !product) {
      return;
    }

    setIsSubmitting(true);

    try {
      const price = parseFloat(formData.price);
      const cost = parseFloat(formData.cost);

      const updateData = {
        name: formData.name.trim(),
        category: formData.category || "",
        price,
        purchase_price: cost,
        allergens: formData.allergens,
        calories: formData.calories,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat,
        serving: formData.serving,
      };

      await onEditProduct(product.id, updateData);
      onClose();
    } catch (error) {
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a server/CDN
      // For now, we'll create a local URL
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, image: imageUrl }));
    }
  };

  if (!isOpen || !product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md max-h-[90vh] overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <Card className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 id="modal-title" className="text-xl font-semibold">
                Modifier le produit
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onClose}
                aria-label="Fermer la modal"
                title="Fermer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom du produit */}
              <div>
                <label
                  htmlFor="edit-product-name"
                  className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text"
                >
                  Nom du produit *
                </label>
                <Input
                  ref={firstInputRef}
                  id="edit-product-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  placeholder="Ex: Coca-Cola 33cl"
                  className="placeholder-gray"
                />
                {errors.name && (
                  <p
                    id="name-error"
                    className="text-sm text-red-600 mt-1"
                    role="alert"
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Catégorie */}
              <div>
                <label
                  htmlFor="edit-product-category"
                  className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text"
                >
                  Catégorie *
                </label>
                <select
                  id="edit-product-category"
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className="w-full h-10 px-3 py-2 text-sm border border-light-border dark:border-dark-border rounded-xl bg-light-background dark:bg-dark-background focus:outline-none focus:ring-2 focus:ring-light-secondary dark:focus:ring-dark-secondary"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prix */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="edit-product-price"
                    className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text"
                  >
                    Prix de vente (€) *
                  </label>
                  <Input
                    id="edit-product-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    aria-invalid={!!errors.price}
                    aria-describedby={errors.price ? "price-error" : undefined}
                    placeholder="2.50"
                    className="placeholder-gray"
                  />
                  {errors.price && (
                    <p
                      id="price-error"
                      className="text-sm text-red-600 mt-1"
                      role="alert"
                    >
                      {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="edit-product-cost"
                    className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text"
                  >
                    Prix d&apos;achat (€) *
                  </label>
                  <Input
                    id="edit-product-cost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost}
                    onChange={(e) => handleInputChange("cost", e.target.value)}
                    aria-invalid={!!errors.cost}
                    aria-describedby={errors.cost ? "cost-error" : undefined}
                    placeholder="1.20"
                    className="placeholder-gray"
                  />
                  {errors.cost && (
                    <p
                      id="cost-error"
                      className="text-sm text-red-600 mt-1"
                      role="alert"
                    >
                      {errors.cost}
                    </p>
                  )}
                </div>
              </div>

              {/* Allergènes (optionnel) */}
              <div>
                <label
                  htmlFor="edit-product-allergens"
                  className="block text-sm font-medium mb-1 text-light-text dark:text-dark-text"
                >
                  Allergènes (optionnel)
                </label>
                <Input
                  id="edit-product-allergens"
                  type="text"
                  value={formData.allergens}
                  onChange={(e) =>
                    handleInputChange("allergens", e.target.value)
                  }
                  placeholder="Ex: Gluten, Arachides, Lait (séparés par des virgules)"
                  className="placeholder-gray"
                />
                <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
                  Séparez les allergènes par des virgules
                </p>
              </div>

              {/* Valeurs nutritionnelles (optionnel) */}
              <div>
                <label className="block text-sm font-medium mb-2 text-light-text dark:text-dark-text">
                  Valeurs nutritionnelles (optionnel)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="edit-product-calories"
                      className="block text-xs text-light-textSecondary dark:text-dark-textSecondary mb-1"
                    >
                      Calories (kcal)
                    </label>
                    <Input
                      id="edit-product-calories"
                      type="number"
                      min="0"
                      value={formData.calories}
                      onChange={(e) =>
                        handleInputChange("calories", e.target.value)
                      }
                      placeholder="150"
                      className="placeholder-gray"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-product-protein"
                      className="block text-xs text-light-text dark:text-dark-textSecondary mb-1"
                    >
                      Protéines (g)
                    </label>
                    <Input
                      id="edit-product-protein"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.protein}
                      onChange={(e) =>
                        handleInputChange("protein", e.target.value)
                      }
                      placeholder="2.5"
                      className="placeholder-gray"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-product-carbs"
                      className="block text-xs text-light-text dark:text-dark-textSecondary mb-1"
                    >
                      Glucides (g)
                    </label>
                    <Input
                      id="edit-product-carbs"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.carbs}
                      onChange={(e) =>
                        handleInputChange("carbs", e.target.value)
                      }
                      placeholder="35"
                      className="placeholder-gray"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="edit-product-fat"
                      className="block text-xs text-light-text dark:text-dark-textSecondary mb-1"
                    >
                      Lipides (g)
                    </label>
                    <Input
                      id="edit-product-fat"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.fat}
                      onChange={(e) => handleInputChange("fat", e.target.value)}
                      placeholder="0.2"
                      className="placeholder-gray"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label
                    htmlFor="edit-product-serving"
                    className="block text-xs text-light-text dark:text-dark-textSecondary mb-1"
                  >
                    Portion de référence
                  </label>
                  <Input
                    id="edit-product-serving"
                    type="text"
                    value={formData.serving}
                    onChange={(e) =>
                      handleInputChange("serving", e.target.value)
                    }
                    placeholder="Ex: 100g, 33cl, 1 pièce"
                    className="placeholder-gray"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                  aria-describedby="submit-help"
                >
                  {isSubmitting ? "Modification..." : "Modifier le produit"}
                </Button>
              </div>

              <p
                id="submit-help"
                className="text-xs text-light-text dark:text-dark-textSecondary"
              >
                * Champs obligatoires
              </p>
            </form>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
