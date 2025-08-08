import React from "react";
import { Text, TouchableOpacity } from "react-native";
import BarcodeIcon from "../../assets/images/barcode_icon.svg";

interface BarcodeButtonProps {
  isDark: boolean;
  onPress: () => void;
  buttonTextColor: string; // from theme hook
}

export function BarcodeButton({
  isDark,
  onPress,
  buttonTextColor,
}: BarcodeButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`${isDark ? "bg-dark-secondary" : "bg-light-secondary"} rounded-lg px-6 py-3 mb-6 flex-row items-center justify-center gap-2 mx-4`}
    >
      <BarcodeIcon width={24} height={24} fill={buttonTextColor} />
      <Text
        className={`${isDark ? "text-dark-buttonText" : "text-light-buttonText"} text-lg font-medium`}
      >
        Mon identifiant
      </Text>
    </TouchableOpacity>
  );
}
