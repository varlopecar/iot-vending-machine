"use client";

import { useEffect, useState } from "react";
import { Button, Input } from "../ui";
import { api } from "../../lib/trpc/client";

interface MachineSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  machineId: string;
  initialLabel: string;
  initialLocation: string;
  initialContact?: string | null;
  onSaved?: () => void;
  onDeleted?: () => void;
}

export function MachineSettingsModal({
  isOpen,
  onClose,
  machineId,
  initialLabel,
  initialLocation,
  initialContact,
  onSaved,
  onDeleted,
}: MachineSettingsModalProps) {
  const [label, setLabel] = useState(initialLabel);
  const [location, setLocation] = useState(initialLocation);
  const [contact, setContact] = useState(initialContact || "");

  useEffect(() => {
    if (isOpen) {
      setLabel(initialLabel);
      setLocation(initialLocation);
      setContact(initialContact || "");
    }
  }, [isOpen, initialLabel, initialLocation, initialContact]);

  const updateMutation = api.machines.updateMachine.useMutation({
    onSuccess: () => {
      onSaved?.();
      onClose();
    },
    onError: (err) => alert(err.message),
  });

  const deleteMutation = api.machines.deleteMachine.useMutation({
    onSuccess: () => {
      onDeleted?.();
      onClose();
    },
    onError: (err) => alert(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id: machineId,
      data: {
        label,
        location,
        ...(contact ? { contact } : { contact: undefined }),
      },
    });
  };

  const handleDelete = () => {
    if (!confirm("Supprimer cette machine ? Cette action est irréversible."))
      return;
    deleteMutation.mutate({ id: machineId });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Paramètres de la machine
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
              htmlFor="label"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nom
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
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Localisation
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
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email du contact
            </label>
            <Input
              id="contact"
              type="email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="email@exemple.com"
            />
          </div>

          <div className="space-y-3 pt-4">
            {/* Bouton Supprimer prend toute la ligne */}
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="w-full"
            >
              {deleteMutation.isPending
                ? "Suppression..."
                : "Supprimer la machine"}
            </Button>
            {/* Boutons Annuler et Enregistrer sur une ligne, chacun la moitié */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={updateMutation.isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
