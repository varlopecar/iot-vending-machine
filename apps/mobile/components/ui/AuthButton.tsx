import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useTailwindTheme } from "../../hooks/useTailwindTheme";

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export function AuthButton({
  title,
  onPress,
  disabled = false,
}: AuthButtonProps) {
  const { isDark } = useTailwindTheme();

  return (
    <TouchableOpacity
      className={`w-full py-4 rounded-xl mb-6 ${
        disabled
          ? "bg-gray-400"
          : isDark
            ? "bg-dark-secondary"
            : "bg-light-secondary"
      }`}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text className="text-white text-center font-bold text-lg">{title}</Text>
    </TouchableOpacity>
  );
}
