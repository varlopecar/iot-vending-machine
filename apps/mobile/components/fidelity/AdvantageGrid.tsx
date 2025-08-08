import React from "react";
import { View } from "react-native";
import { Advantage } from "../../types/types";
import { AdvantageCard } from "./AdvantageCard";
import { imageMapping } from "./imageMapping";

interface AdvantageGridProps {
  isDark: boolean;
  advantages: Advantage[];
}

export function AdvantageGrid({ isDark, advantages }: AdvantageGridProps) {
  return (
    <View className="px-4 mt-6">
      <View className="flex-row gap-4 mb-4">
        {advantages.slice(0, 2).map((adv) => (
          <AdvantageCard
            key={adv.id}
            isDark={isDark}
            variant="grid"
            advantage={adv}
            imageSource={imageMapping[adv.image as keyof typeof imageMapping]}
          />
        ))}
      </View>
      {advantages.slice(2).map((adv) => (
        <AdvantageCard
          key={adv.id}
          isDark={isDark}
          variant="list"
          advantage={adv}
          imageSource={imageMapping[adv.image as keyof typeof imageMapping]}
        />
      ))}
    </View>
  );
}
