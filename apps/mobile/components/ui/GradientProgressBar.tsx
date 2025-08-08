import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTailwindTheme } from "../../hooks/useTailwindTheme";

interface GradientProgressBarProps {
  progress: number; // 0-100
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  height?: number;
  showLabels?: boolean;
  labels?: number[];
}

export function GradientProgressBar({
  progress,
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  height = 12,
  showLabels = true,
  labels = [0, 25, 50, 75, 100],
}: GradientProgressBarProps) {
  const { isDark } = useTailwindTheme();
  const progressPercentage = Math.min(Math.max(progress, 0), 100);

  return (
    <View className="mb-6">
      <View
        className="bg-gray-600 rounded-full overflow-hidden mb-2 relative"
        style={{ height }}
      >
        <LinearGradient
          colors={colors as [string, string, ...string[]]}
          start={start}
          end={end}
          style={{
            height: "100%",
            width: `${progressPercentage}%`,
            borderRadius: height / 2,
          }}
        />
        {/* Checkpoints intégrés dans la barre */}
        <View className="absolute inset-0 flex-row items-center justify-between px-2">
          {labels.map((label, index) => (
            <View
              key={`checkpoint-${label}`}
              style={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                className="bg-white rounded-full"
                style={{
                  width: 6,
                  height: 6,
                  zIndex: 10,
                }}
              />
            </View>
          ))}
        </View>
      </View>
      {showLabels && (
        <View className="flex-row justify-between">
          {labels.map((label, index) => (
            <Text
              key={label}
              className={`${isDark ? "text-white" : "text-black"} text-sm`}
              style={{
                textAlign: "center",
                width: 20,
              }}
            >
              {label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
