"use client";

import { useState } from "react";
import { Button, Input } from "../ui";
import { api } from "../../lib/trpc/client";

interface AddMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function AddMachineModal({
  isOpen,
  onClose,
  onCreated,
}: AddMachineModalProps) {
  const [label, setLabel] = useState("");
  const [location, setLocation] = useState("");
  const [contact, setContact] = useState("");

  const createMutation = api.machines.createMachine.useMutation({
    onSuccess: () => {
      onCreated?.();
      onClose();
      setLabel("");
      setLocation("");
      setContact("");
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      label,
      location,
      ...(contact ? { contact } : {}),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-light-background dark:bg-dark-background rounded-lg p-6 w-full max-w-md mx-4 border border-light-border dark:border-dark-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-light-text dark:text-dark-text">
            Ajouter une machine
          </h2>
          <button
            onClick={onClose}
            className="text-light-textSecondary dark:text-dark-textSecondary hover:text-light-text dark:hover:text-dark-text"
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
              htmlFor="label"
              className="block text-sm font-medium text-light-text dark:text-dark-text mb-1"
            >
              Nom de la machine <span className="text-red-500">*</span>
            </label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-light-text dark:text-dark-text mb-1"
            >
              Localisation <span className="text-red-500">*</span>
            </label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              htmlFor="contact"
              className="block text-sm font-medium text-light-text dark:text-dark-text mb-1"
            >
              Contact email (responsable)
            </label>
            <Input
              id="contact"
              type="email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="email@exemple.com"
            />
            <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
              Le statut initial sera Hors ligne. Vous pourrez l'activer après
              configuration.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !label || !location}
            >
              {createMutation.isPending ? "Création..." : "Créer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
