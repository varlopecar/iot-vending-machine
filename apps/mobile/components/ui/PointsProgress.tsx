import React from "react";
import { View } from "react-native";
import { GradientText } from "./GradientText";
import { GradientProgressBar } from "./GradientProgressBar";

interface PointsProgressProps {
  points: number;
  textGradientColors: string[];
  barGradientColors: string[];
}

export function PointsProgress({
  points,
  textGradientColors,
  barGradientColors,
}: PointsProgressProps) {
  const progress = (points / 100) * 100;
  return (
    <View className="mb-2 px-4">
      <GradientText
        colors={textGradientColors}
        style={{ fontSize: 32, fontWeight: "bold" }}
      >
        {`${points} points`}
      </GradientText>
      <View style={{ height: 8 }} />
      <GradientProgressBar
        progress={progress}
        colors={barGradientColors}
        height={12}
      />
    </View>
  );
}
