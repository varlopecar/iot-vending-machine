"use client";

import { useState, useEffect } from "react";
import { Button, Input } from "../ui";
import { api } from "../../lib/trpc/client";

interface AddSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineId: string;
  onSlotAdded?: () => void;
}

export function AddSlotModal({
  isOpen,
  onClose,
  machineId,
  onSlotAdded,
}: AddSlotModalProps) {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [slotNumber, setSlotNumber] = useState<number>(1);
  const [initialQuantity, setInitialQuantity] = useState<number>(0);

  // Récupérer la liste des produits
  const { data: products, isLoading: productsLoading } =
    api.products.getAllProducts.useQuery();

  // Récupérer le prochain slot disponible (si l'endpoint existe)
  const { data: nextSlotNumber, refetch: refetchNextSlot } =
    api.stocks.getNextAvailableSlotNumber?.useQuery(
      { machine_id: machineId },
      { enabled: isOpen }
    ) || { data: undefined, refetch: () => Promise.resolve() };

  // Utils pour invalider les queries
  const utils = api.useUtils();

  // Mutation pour ajouter un slot
  const addSlotMutation = api.stocks.addSlot.useMutation({
    retry: 3, // Retry automatique 3 fois en cas d'erreur de connexion
    retryDelay: 1000, // Attendre 1 seconde entre les tentatives
    onSuccess: () => {
      onSlotAdded?.();
      // Invalider et refetch les queries liées
      utils.stocks.getNextAvailableSlotNumber.invalidate({
        machine_id: machineId,
      });
      onClose();
      resetForm();
    },
    onError: (error) => {
      console.error("Erreur lors de l'ajout du slot:", error);
      // Message plus informatif selon le type d'erreur
      if (
        error.message.includes("Server has closed") ||
        error.message.includes("connection")
      ) {
        alert(
          "Erreur de connexion. Le serveur redémarre peut-être. Réessayez dans quelques secondes."
        );
      } else {
        alert("Erreur: " + error.message);
      }
    },
  });

  const resetForm = () => {
    setSelectedProductId("");
    setSlotNumber(1);
    setInitialQuantity(0);
  };

  // Refetch le prochain slot disponible quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && refetchNextSlot) {
      refetchNextSlot();
    }
  }, [isOpen, refetchNextSlot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      alert("Veuillez sélectionner un produit");
      return;
    }

    addSlotMutation.mutate({
      machine_id: machineId,
      product_id: selectedProductId,
      slot_number: nextSlotNumber || slotNumber,
      initial_quantity: initialQuantity,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Ajouter un slot
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Fermer"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="slot-number"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Numéro de slot
            </label>
            <Input
              id="slot-number"
              type="number"
              min="1"
              max="6"
              value={nextSlotNumber || slotNumber}
              disabled={true}
              className="bg-gray-50"
            />
            <p className="text-sm text-gray-500 mt-1">
              Prochain slot disponible: {nextSlotNumber || "Calcul..."}
            </p>
          </div>

          <div>
            <label
              htmlFor="product-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Produit <span className="text-red-500">*</span>
            </label>
            <select
              id="product-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionnez un produit</option>
              {products?.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.price}€
                </option>
              ))}
            </select>
            {productsLoading && (
              <p className="text-sm text-gray-500 mt-1">
                Chargement des produits...
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="initial-quantity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Quantité initiale
            </label>
            <Input
              id="initial-quantity"
              type="number"
              min="0"
              max="4"
              value={initialQuantity}
              onChange={(e) => setInitialQuantity(Number(e.target.value))}
            />
            <p className="text-sm text-gray-500 mt-1">
              Entre 0 et 4 produits (capacité maximale: 4)
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={addSlotMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={addSlotMutation.isPending || !selectedProductId}
            >
              {addSlotMutation.isPending ? "Ajout..." : "Ajouter le slot"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
