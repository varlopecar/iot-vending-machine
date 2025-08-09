import React from "react";
import { ActionButton } from "../ui/ActionButton";

interface OfferActionsProps {
  isDark: boolean;
  isValid: boolean;
  onSubmit: () => void;
}

export function OfferActions({ isDark, isValid, onSubmit }: OfferActionsProps) {
  return (
    <ActionButton
      onPress={onSubmit}
      disabled={!isValid}
      isDark={isDark}
      variant="default"
      size="large"
    >
      Ajouter l&apos;offre
    </ActionButton>
  );
}
