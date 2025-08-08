import React from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { HistoryEntry } from "../../types/types";

interface HistoryListProps {
  isDark: boolean;
  entries: HistoryEntry[];
  gradientColors: string[];
}

export function HistoryList({
  isDark,
  entries,
  gradientColors,
}: HistoryListProps) {
  return (
    <View
      className={`${isDark ? "bg-dark-border" : "bg-light-border"} overflow-hidden`}
    >
      {entries.map((entry, index) => (
        <View
          key={entry.id}
          className={`flex-row items-center justify-between px-4 py-4 ${
            index < entries.length - 1
              ? isDark
                ? "border-b border-dark-primary"
                : "border-b border-light-primary"
              : ""
          }`}
        >
          <View className="flex-1">
            <Text
              className={`${isDark ? "text-dark-text" : "text-light-text"} font-bold text-lg`}
            >
              {entry.date}
            </Text>
            <Text
              className={`${isDark ? "text-dark-textSecondary" : "text-light-textSecondary"} text-lg font-bold`}
            >
              {entry.location}
            </Text>
          </View>
          <LinearGradient
            colors={gradientColors as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 72, height: 72, borderRadius: 9999, padding: 3 }}
          >
            <View
              className={`${isDark ? "bg-dark-border" : "bg-light-border"} rounded-full flex-1 items-center justify-center`}
            >
              <Text
                className={`${isDark ? "text-dark-text" : "text-light-text"} text-xl font-extrabold`}
              >
                +{entry.points}
              </Text>
              <Text
                className={`${isDark ? "text-dark-text" : "text-light-text"} text-xs font-semibold`}
              >
                points
              </Text>
            </View>
          </LinearGradient>
        </View>
      ))}
    </View>
  );
}
