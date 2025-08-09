import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface ActionButtonProps {
  onPress: () => void;
  disabled?: boolean;
  isDark: boolean;
  variant?: "default" | "outline";
  size?: "small" | "medium" | "large";
  children: React.ReactNode;
}

export function ActionButton({
  onPress,
  disabled = false,
  isDark,
  variant = "default",
  size = "medium",
  children,
}: ActionButtonProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "px-3 py-2";
      case "large":
        return "px-6 py-4";
      default:
        return "px-4 py-3";
    }
  };

  const getTextSizeClasses = () => {
    switch (size) {
      case "small":
        return "text-sm";
      case "large":
        return "text-xl";
      default:
        return "text-lg";
    }
  };

  const getVariantClasses = () => {
    if (variant === "outline") {
      return {
        button: `border-2 ${isDark ? "border-dark-secondary bg-transparent" : "border-light-secondary bg-transparent"}`,
        text: `${isDark ? "text-dark-secondary" : "text-light-secondary"}`,
      };
    }
    return {
      button: `${isDark ? "bg-dark-secondary" : "bg-light-secondary"}`,
      text: `${isDark ? "text-dark-buttonText" : "text-white"}`,
    };
  };

  const sizeClasses = getSizeClasses();
  const textSizeClasses = getTextSizeClasses();
  const variantClasses = getVariantClasses();

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      className={`${variantClasses.button} ${sizeClasses} rounded-lg ${disabled ? "opacity-50" : ""}`}
    >
      <Text
        className={`${variantClasses.text} ${textSizeClasses} font-bold text-center`}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}
