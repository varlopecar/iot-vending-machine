import React from "react";
import { View, Text } from "react-native";

interface SelectionSummaryProps {
  isDark: boolean;
  summaryText: string;
  pointsCost: number;
  currentPoints: number;
}

export function SelectionSummary({
  isDark,
  summaryText,
  pointsCost,
  currentPoints,
}: SelectionSummaryProps) {
  return (
    <View>
      {summaryText && (
        <Text
          className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-sm mb-2`}
        >
          {summaryText}
        </Text>
      )}
      <View className="flex-row justify-between mb-3">
        <Text
          className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-base`}
        >
          Coût en points
        </Text>
        <Text
          className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-base font-bold`}
        >
          {pointsCost} pts
        </Text>
      </View>
      <View className="flex-row justify-between mb-3">
        <Text
          className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-base`}
        >
          Points restants
        </Text>
        <Text
          className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-base font-bold`}
        >
          {currentPoints}
        </Text>
      </View>
    </View>
  );
}
