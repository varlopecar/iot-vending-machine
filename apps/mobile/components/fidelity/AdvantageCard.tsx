import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import PlusIcon from "../../assets/images/plus.svg";
import { Advantage } from "../../types/types";

interface AdvantageCardProps {
  isDark: boolean;
  variant: "grid" | "list";
  advantage: Advantage;
  imageSource: any;
}

export function AdvantageCard({
  isDark,
  variant,
  advantage,
  imageSource,
}: AdvantageCardProps) {
  if (variant === "grid") {
    return (
      <TouchableOpacity
        className={`flex-1 ${isDark ? "bg-dark-border" : "bg-light-border"} rounded-lg p-4`}
      >
        <View className="items-start">
          <Image
            source={imageSource}
            style={{
              width: 120,
              height: 120,
              marginBottom: 12,
              alignSelf: "center",
            }}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={200}
          />
          <Text
            className={`${isDark ? "text-dark-text" : "text-light-text"} text-xl text-center mb-1`}
          >
            {advantage.title}
          </Text>
          <Text
            className={`${isDark ? "text-dark-text" : "text-light-text"} font-extrabold text-base mb-3`}
          >
            {advantage.points} points
          </Text>
          <View className="w-8 h-8 rounded-full self-end items-center justify-center">
            <PlusIcon
              width={24}
              height={24}
              color={isDark ? "#FEFCFA" : "#3A2E2C"}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      className={`${isDark ? "bg-dark-border" : "bg-light-border"} rounded-lg px-4 py-8 mb-4`}
    >
      <View className="flex-row items-center">
        <Image
          source={imageSource}
          style={{ width: 120, height: 120, marginRight: 12 }}
          contentFit="contain"
          cachePolicy="memory-disk"
          transition={200}
        />
        <View className="flex-col items-start flex-1 gap-8">
          <View className="flex-col items-start">
            <Text
              className={`${isDark ? "text-dark-text" : "text-light-text"} text-xl text-center mb-1`}
            >
              {advantage.title}
            </Text>
            {advantage.description && (
              <Text
                className={`${isDark ? "text-dark-textSecondary" : "text-light-textSecondary"} text-sm`}
              >
                {advantage.description}
              </Text>
            )}
            <Text
              className={`${isDark ? "text-dark-text" : "text-light-text"} font-extrabold text-base mb-3`}
            >
              {advantage.points} points
            </Text>
          </View>
          <View className="self-end">
            <View className="w-8 h-8 rounded-full self-end items-center justify-center">
              <PlusIcon
                width={24}
                height={24}
                color={isDark ? "#FEFCFA" : "#3A2E2C"}
              />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
