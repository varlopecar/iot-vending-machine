import React, { useCallback, RefObject } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { AuthUser } from "../../lib/api";
import IdentifierCard from "./IdentifierCard";

interface BottomSheetBarcodeProps {
  isDark: boolean;
  bottomSheetRef: RefObject<BottomSheet | null>;
  index: number; // 1 or -1
  snapPoints: (string | number)[];
  onChange: (index: number) => void;
  onClosePress: () => void;
  user: AuthUser | null; // Ajout de l'utilisateur
}

export function BottomSheetBarcode({
  isDark,
  bottomSheetRef,
  index,
  snapPoints,
  onChange,
  onClosePress,
  user,
}: BottomSheetBarcodeProps) {
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={index}
      snapPoints={snapPoints}
      onChange={onChange}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{
        backgroundColor: isDark ? "#6B7280" : "#9CA3AF",
        width: 40,
        height: 4,
      }}
      backgroundStyle={{ backgroundColor: isDark ? "#2C2221" : "#F9F4EC" }}
    >
      <BottomSheetView className="flex-1">
        <View className="flex-row items-center px-6 mb-6">
          <TouchableOpacity
            onPress={onClosePress}
            className="w-8 h-8 items-center justify-center"
          >
            <Text
              className={`${isDark ? "text-dark-text" : "text-light-text"} text-2xl font-bold`}
            >
              ×
            </Text>
          </TouchableOpacity>
          <Text
            className={`${isDark ? "text-dark-text" : "text-light-text"} text-xl font-bold text-center flex-1`}
          >
            Mon identifiant
          </Text>
          <View className="w-8" />
        </View>
        <View className="flex-1 px-6 pb-6">
          <View className="flex-1 justify-center">
            {user?.barcode ? (
              <IdentifierCard
                identifier={user.barcode}
                onCopy={() => {}}
                showCopyButton={true}
              />
            ) : (
              <View
                className={`${isDark ? "bg-dark-border" : "bg-light-border"} rounded-lg items-center justify-center flex-1 p-8`}
              >
                <Text
                  className={`${isDark ? "text-dark-text" : "text-light-text"} text-center text-lg`}
                >
                  Aucun code-barres disponible
                </Text>
              </View>
            )}
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
