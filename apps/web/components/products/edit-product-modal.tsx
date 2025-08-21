"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { trpc } from "@/lib/trpc/client";

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onSuccess: () => void;
}

const categories = ["Boissons", "Snacks", "Confiseries", "Sandwichs", "Autres"] as const;

export function EditProductModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: categories[0] || "Boissons",
    price: "",
    purchase_price: "",
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

  const updateProductMutation = trpc.products.updateProduct.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      resetForm();
    },
  });

  // Initialize form with product data
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || "",
        category: product.category || categories[0] || "Boissons",
        price: product.price?.toString() || "",
        purchase_price: product.purchase_price?.toString() || "",
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

    const purchasePrice = parseFloat(formData.purchase_price);
    if (!formData.purchase_price || isNaN(purchasePrice) || purchasePrice <= 0) {
      newErrors.purchase_price = "Le prix d&apos;achat doit être un nombre positif";
    }

    // Check if purchase price is greater than price
    if (!newErrors.price && !newErrors.purchase_price && purchasePrice >= price) {
      newErrors.purchase_price = "Le prix d&apos;achat doit être inférieur au prix de vente";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: categories[0] || "Boissons",
      price: "",
      purchase_price: "",
      allergens: "",
      calories: "",
      protein: "",
      carbs: "",
      fat: "",
      serving: "",
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !product) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Préparer les allergènes
      const allergens_list = formData.allergens
        ? formData.allergens
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a.length > 0)
        : undefined;

      // Préparer les valeurs nutritionnelles
      const nutritional =
        formData.calories ||
          formData.protein ||
          formData.carbs ||
          formData.fat ||
          formData.serving
          ? {
            calories: formData.calories ? parseFloat(formData.calories) : undefined,
            protein: formData.protein ? parseFloat(formData.protein) : undefined,
            carbs: formData.carbs ? parseFloat(formData.carbs) : undefined,
            fat: formData.fat ? parseFloat(formData.fat) : undefined,
            serving: formData.serving || "",
          }
          : undefined;

      await updateProductMutation.mutateAsync({
        id: product.id,
        data: {
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          purchase_price: parseFloat(formData.purchase_price),
          allergens_list,
          nutritional,
        },
      });
    } catch (error) {
      console.error("Erreur lors de la modification du produit:", error);
      setErrors({ submit: "Erreur lors de la modification du produit. Veuillez réessayer." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl"
          >
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Modifier le produit
                </h2>
                <Button
                  onClick={handleClose}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Informations de base */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Informations de base</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom du produit *
                    </label>
                    <Input
                      ref={firstInputRef}
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Ex: Coca-Cola 330ml"
                      className={errors.name ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Catégorie *
                    </label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      disabled={isSubmitting}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Prix de vente (€) *
                    </label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      placeholder="0.00"
                      className={errors.price ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700 mb-1">
                      Prix d&apos;achat (€) *
                    </label>
                    <Input
                      id="purchase_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.purchase_price}
                      onChange={(e) => handleInputChange("purchase_price", e.target.value)}
                      placeholder="0.00"
                      className={errors.purchase_price ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.purchase_price && (
                      <p className="mt-1 text-sm text-red-600">{errors.purchase_price}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Allergènes */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Allergènes</h3>
                <div>
                  <label htmlFor="allergens" className="block text-sm font-medium text-gray-700 mb-1">
                    Allergènes (séparés par des virgules)
                  </label>
                  <Input
                    id="allergens"
                    type="text"
                    value={formData.allergens}
                    onChange={(e) => handleInputChange("allergens", e.target.value)}
                    placeholder="Ex: Gluten, Lactose, Fruits à coque"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Valeurs nutritionnelles */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Valeurs nutritionnelles (optionnel)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-1">
                      Calories
                    </label>
                    <Input
                      id="calories"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.calories}
                      onChange={(e) => handleInputChange("calories", e.target.value)}
                      placeholder="kcal"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="protein" className="block text-sm font-medium text-gray-700 mb-1">
                      Protéines (g)
                    </label>
                    <Input
                      id="protein"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.protein}
                      onChange={(e) => handleInputChange("protein", e.target.value)}
                      placeholder="g"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="carbs" className="block text-sm font-medium text-gray-700 mb-1">
                      Glucides (g)
                    </label>
                    <Input
                      id="carbs"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.carbs}
                      onChange={(e) => handleInputChange("carbs", e.target.value)}
                      placeholder="g"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="fat" className="block text-sm font-medium text-gray-700 mb-1">
                      Lipides (g)
                    </label>
                    <Input
                      id="fat"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.fat}
                      onChange={(e) => handleInputChange("fat", e.target.value)}
                      placeholder="g"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="serving" className="block text-sm font-medium text-gray-700 mb-1">
                    Portion
                  </label>
                  <Input
                    id="serving"
                    type="text"
                    value={formData.serving}
                    onChange={(e) => handleInputChange("serving", e.target.value)}
                    placeholder="Ex: 100g, 330ml"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Error message */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? "Modification..." : "Modifier le produit"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
