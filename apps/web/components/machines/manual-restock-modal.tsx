"use client";

import { useState, useEffect } from "react";
import { Button, Input } from "../ui";
import { api } from "../../lib/trpc/client";

interface ManualRestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: {
    id: string;
    product_name: string;
    quantity: number;
    max_capacity: number;
    slot_number: number;
  };
  onRestockComplete?: () => void;
}

export function ManualRestockModal({
  isOpen,
  onClose,
  slot,
  onRestockComplete,
}: ManualRestockModalProps) {
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");

  // Utils pour invalider les queries
  const utils = api.useUtils();

  // Mutation pour ravitailler manuellement
  const manualRestockMutation = api.restocks.manualRestock.useMutation({
    retry: 3,
    retryDelay: 1000,
    onSuccess: () => {
      onRestockComplete?.();
      // Invalider les queries liées
      utils.stocks.getStocksByMachine.invalidate();
      onClose();
      resetForm();
    },
    onError: (error) => {
      console.error("Erreur lors du ravitaillement:", error);
      if (error.message.includes("Server has closed") || error.message.includes("connection")) {
        alert("Erreur de connexion. Le serveur redémarre peut-être. Réessayez dans quelques secondes.");
      } else {
        alert("Erreur: " + error.message);
      }
    },
  });

  const resetForm = () => {
    setQuantity(1);
    setNotes("");
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (quantity <= 0) {
      alert("La quantité doit être positive");
      return;
    }

    const newTotal = slot.quantity + quantity;
    if (newTotal > slot.max_capacity) {
      alert(`La quantité totale (${newTotal}) dépasserait la capacité maximale (${slot.max_capacity})`);
      return;
    }

    manualRestockMutation.mutate({
      stock_id: slot.id,
      quantity: quantity,
      notes: notes.trim() || undefined,
    });
  };

  const maxQuantityToAdd = slot.max_capacity - slot.quantity;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Ravitailler le slot {slot.slot_number}
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
          {/* Informations du slot */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">{slot.product_name}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Stock actuel: <span className="font-medium">{slot.quantity}</span></p>
              <p>Capacité max: <span className="font-medium">{slot.max_capacity}</span></p>
              <p>Peut ajouter: <span className="font-medium text-green-600">{maxQuantityToAdd}</span></p>
            </div>
          </div>

          {/* Quantité à ajouter */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantité à ajouter <span className="text-red-500">*</span>
            </label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={maxQuantityToAdd}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum ajoutale: {maxQuantityToAdd}
            </p>
          </div>

          {/* Notes optionnelles */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optionnel)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Raison du ravitaillement, observations..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={manualRestockMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={manualRestockMutation.isPending || maxQuantityToAdd === 0}
            >
              {manualRestockMutation.isPending ? "Ravitaillement..." : `Ajouter ${quantity}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
