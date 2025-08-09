import React from "react";
import { View, Text } from "react-native";

interface FormSectionProps {
  title?: string;
  isDark: boolean;
  children: React.ReactNode;
}

export function FormSection({ title, isDark, children }: FormSectionProps) {
  return (
    <View className="mb-4">
      {title && (
        <Text
          className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-xl font-bold px-4 pt-4`}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}
