import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface TabsProps<T extends string> {
  isDark: boolean;
  active: T;
  options: { key: T; label: string }[];
  onChange: (key: T) => void;
}

export function Tabs<T extends string>({
  isDark,
  active,
  options,
  onChange,
}: TabsProps<T>) {
  return (
    <View
      className={`${isDark ? "bg-dark-border" : "bg-light-border"} flex-row items-center border-b ${isDark ? "border-dark-primary" : "border-light-primary"}`}
    >
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.key}
          onPress={() => onChange(opt.key)}
          className={`px-6 w-1/2 py-5 flex-row items-center justify-center gap-2 relative`}
        >
          <Text
            className={`${isDark ? "text-dark-text" : "text-light-text"} text-lg ${active === opt.key ? "font-bold" : "font-medium"}`}
          >
            {opt.label}
          </Text>
          {active === opt.key && (
            <View
              className={`absolute bottom-0 left-0 right-0 h-1 mx-2 rounded-full ${isDark ? "bg-dark-secondary" : "bg-light-secondary"}`}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}
