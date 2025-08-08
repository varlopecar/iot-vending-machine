import React, { useCallback, RefObject } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";

interface BottomSheetBarcodeProps {
  isDark: boolean;
  bottomSheetRef: RefObject<BottomSheet>;
  index: number; // 1 or -1
  snapPoints: (string | number)[];
  onChange: (index: number) => void;
  onClosePress: () => void;
}

export function BottomSheetBarcode({
  isDark,
  bottomSheetRef,
  index,
  snapPoints,
  onChange,
  onClosePress,
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

  const { height } = Dimensions.get("window");
  const imageHeight = height * 0.3;

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
          <View
            className={`${isDark ? "bg-dark-border" : "bg-light-border"} rounded-lg items-center justify-center flex-1`}
            style={{ padding: 20 }}
          >
            <Image
              source={require("../../assets/images/barcode.jpg")}
              style={{ width: "100%", height: imageHeight }}
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={200}
            />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
