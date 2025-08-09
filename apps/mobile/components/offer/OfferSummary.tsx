import React from "react";
import { SelectionSummary } from "../ui/SelectionSummary";

interface OfferSummaryProps {
  isDark: boolean;
  summaryText: string;
  pointsCost: number;
  currentPoints: number;
}

export function OfferSummary({
  isDark,
  summaryText,
  pointsCost,
  currentPoints,
}: OfferSummaryProps) {
  return (
    <SelectionSummary
      isDark={isDark}
      summaryText={summaryText}
      pointsCost={pointsCost}
      currentPoints={currentPoints}
    />
  );
}
