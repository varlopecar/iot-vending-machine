"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Input } from "../ui";
import { api } from "../../lib/trpc/client";
import type { Product } from "@/lib/types/trpc";

interface EditSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    max_capacity: number;
    slot_number: number;
    machine_id: string;
  } | null;
  onSaved?: () => void;
}

export function EditSlotModal({
  isOpen,
  onClose,
  slot,
  onSaved,
}: EditSlotModalProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(0);

  const utils = api.useUtils();

  // Charger la liste des produits
  const { data: products, isLoading: productsLoading } =
    api.products.getAllProducts.useQuery(undefined, { enabled: isOpen });

  // Pré-remplir quand on ouvre
  useEffect(() => {
    if (isOpen && slot) {
      setSelectedProductId(slot.product_id);
      setQuantity(slot.quantity);
    }
  }, [isOpen, slot]);

  const updateStockMutation = api.stocks.updateStock.useMutation({
    onSuccess: () => {
      // Invalider les stocks par machine
      utils.stocks.getStocksByMachine.invalidate({
        machine_id: slot?.machine_id || "",
      });
      onSaved?.();
      onClose();
    },
    onError: (error: any) => {
      const msg = error.message || "";
      if (
        msg.toLowerCase().includes("capacité maximale") ||
        msg.includes("capacité")
      ) {
        alert("La quantité demandée dépasse la capacité du slot.");
        return;
      }
      alert("Erreur: " + msg);
    },
  });

  const capacityText = useMemo(() => {
    if (!slot) return "";
    return `Capacité max (backend): ${slot.max_capacity}`;
  }, [slot]);

  if (!isOpen || !slot) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      alert("Veuillez sélectionner un produit");
      return;
    }

    if (quantity < 0) {
      alert("La quantité ne peut pas être négative");
      return;
    }

    // Le backend valide la capacité maximale; on supprime la contrainte côté front

    updateStockMutation.mutate({
      id: slot.id,
      data: {
        product_id: selectedProductId,
        quantity,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Modifier le slot #{slot.slot_number}
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
              htmlFor="product-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Produit
            </label>
            <select
              id="product-select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {productsLoading && <option>Chargement...</option>}
              {!productsLoading && (
                <>
                  {products?.map((p: Product) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.price}€
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Quantité
            </label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
            <p className="text-sm text-gray-500 mt-1">{capacityText}</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateStockMutation.isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={updateStockMutation.isPending}>
              {updateStockMutation.isPending
                ? "Enregistrement..."
                : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
