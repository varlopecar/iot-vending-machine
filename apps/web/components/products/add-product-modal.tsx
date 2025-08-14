"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Package } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";
import { Product } from "./product-card";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<Product, "id" | "sold">) => void;
}

const categories = ["Boissons", "Snacks", "Confiseries", "Sandwichs", "Autres"];

export function AddProductModal({
  isOpen,
  onClose,
  onAddProduct,
}: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    category: categories[0],
    price: "",
    cost: "",
    image: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      newErrors.cost = "Le prix d'achat doit être un nombre positif";
    }

    if (!formData.image.trim()) {
      newErrors.image = "L'image du produit est requise";
    }

    // Check if cost is greater than price
    if (!newErrors.price && !newErrors.cost && cost >= price) {
      newErrors.cost = "Le prix d'achat doit être inférieur au prix de vente";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const price = parseFloat(formData.price);
      const cost = parseFloat(formData.cost);

      const newProduct: Omit<Product, "id" | "sold"> = {
        name: formData.name.trim(),
        category: formData.category || "",
        price,
        cost,
        margin: price - cost,
        stock: 0, // Stock initial à 0
        image: formData.image,
      };

      await onAddProduct(newProduct);

      // Reset form
      setFormData({
        name: "",
        category: categories[0],
        price: "",
        cost: "",
        image: "",
      });

      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
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

  if (!isOpen) return null;

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
          className="relative w-full max-w-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <Card className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 id="modal-title" className="text-xl font-semibold">
                Ajouter un produit
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
                  htmlFor="product-name"
                  className="block text-sm font-medium mb-1"
                >
                  Nom du produit *
                </label>
                <Input
                  ref={firstInputRef}
                  id="product-name"
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
                  htmlFor="product-category"
                  className="block text-sm font-medium mb-1"
                >
                  Catégorie *
                </label>
                <select
                  id="product-category"
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
                    htmlFor="product-price"
                    className="block text-sm font-medium mb-1"
                  >
                    Prix de vente (€) *
                  </label>
                  <Input
                    id="product-price"
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
                    htmlFor="product-cost"
                    className="block text-sm font-medium mb-1"
                  >
                    Prix d'achat (€) *
                  </label>
                  <Input
                    id="product-cost"
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

              {/* Image */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Image du produit *
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 bg-light-tertiary dark:bg-dark-tertiary rounded-lg overflow-hidden">
                    {formData.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.image}
                        alt="Aperçu du produit"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-light-textSecondary dark:text-dark-textSecondary">
                        <Package className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Sélectionner une image"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choisir une image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    aria-label="Fichier image"
                  />
                </div>
                {errors.image && (
                  <p className="text-sm text-red-600 mt-1" role="alert">
                    {errors.image}
                  </p>
                )}
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
                  {isSubmitting ? "Ajout..." : "Ajouter le produit"}
                </Button>
              </div>

              <p
                id="submit-help"
                className="text-xs text-light-textSecondary dark:text-dark-textSecondary"
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
