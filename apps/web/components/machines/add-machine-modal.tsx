"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button, Input } from "../ui";
import { trpc } from "../../lib/trpc/client";

interface AddMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onRedirect?: (machineId: string) => void;
}

export function AddMachineModal({
  isOpen,
  onClose,
  onSuccess,
  onRedirect,
}: AddMachineModalProps) {
  const [formData, setFormData] = useState({
    label: "",
    location: "",
    contact: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = trpc.machines.createMachine.useMutation({
    onSuccess: (data) => {
      onSuccess();
      if (onRedirect && data.id) {
        onRedirect(data.id);
      }
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      label: "",
      location: "",
      contact: "",
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.label.trim()) {
      newErrors.label = "Le nom de la machine est requis";
    }

    if (!formData.location.trim()) {
      newErrors.location = "La localisation est requise";
    }

    if (
      formData.contact &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact)
    ) {
      newErrors.contact = "L'adresse email n'est pas valide";
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
      await createMutation.mutateAsync({
        label: formData.label,
        location: formData.location,
        ...(formData.contact ? { contact: formData.contact } : {}),
      });
    } catch (error) {
      console.error("Erreur lors de la création de la machine:", error);
      setErrors({
        submit: "Erreur lors de la création de la machine. Veuillez réessayer.",
      });
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-white rounded-lg shadow-xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Ajouter une machine
              </h2>
              <Button
                onClick={handleClose}
                variant="outline"
                size="sm"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Fermer
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="label"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nom de la machine *
                </label>
                <Input
                  id="label"
                  type="text"
                  value={formData.label}
                  onChange={(e) => handleInputChange("label", e.target.value)}
                  placeholder="Ex: Distributeur A"
                  className={errors.label ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.label && (
                  <p className="mt-1 text-sm text-red-600">{errors.label}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Localisation *
                </label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="Ex: Rez-de-chaussée, Hall principal"
                  className={errors.location ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contact (optionnel)
                </label>
                <Input
                  id="contact"
                  type="email"
                  value={formData.contact}
                  onChange={(e) => handleInputChange("contact", e.target.value)}
                  placeholder="contact@example.com"
                  className={errors.contact ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {errors.contact && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact}</p>
                )}
              </div>

              {/* Error message */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
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
                  {isSubmitting ? "Création..." : "Créer la machine"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
