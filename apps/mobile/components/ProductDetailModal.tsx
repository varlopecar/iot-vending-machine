import React, { useMemo, useRef, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTailwindTheme } from "../hooks/useTailwindTheme";
import { Product } from "../types/product";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";

interface ProductDetailModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
}

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}

function ExpandableSection({
  title,
  children,
  isDark,
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View className="mb-4">
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between py-3"
      >
        <Text
          className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-lg font-semibold`}
        >
          {title}
        </Text>
        <Ionicons
          name={isExpanded ? "chevron-down" : "chevron-up"}
          size={20}
          color={isDark ? "#FEFCFA" : "#3A2E2C"}
        />
      </TouchableOpacity>
      {isExpanded && <View className="pl-4">{children}</View>}
    </View>
  );
}

export default function ProductDetailModal({
  product,
  visible,
  onClose,
}: ProductDetailModalProps) {
  const { isDark } = useTailwindTheme();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%", "90%"], []);
  const [headerSolid, setHeaderSolid] = useState(false);

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

  const handleChange = (index: number) => {
    if (index === -1) onClose();
  };

  if (!product) return null;

  const borderColor = isDark ? "#493837" : "#F3E9D8";
  const backgroundColor = isDark ? "#2C2221" : "#F9F4EC";

  const Separator = ({ borderColor }: { borderColor: string }) => {
    return (
      <View
        style={{
          width: "100%",
          borderWidth: 0.5,
          borderStyle: "dashed",
          borderColor: borderColor,
        }}
      />
    );
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={visible ? 1 : -1}
      snapPoints={snapPoints}
      onChange={handleChange}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: backgroundColor }}
      handleIndicatorStyle={{ opacity: 0, width: 0, height: 0 }}
      handleStyle={{
        display: "none",
      }}
    >
      <BottomSheetView
        style={{
          flex: 1,
          marginTop: 0,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        {/* Header (devient couleur 'border' quand on scroll) */}
        <View
          className="flex-row items-center justify-between p-6"
          style={{
            backgroundColor: headerSolid ? borderColor : backgroundColor,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <TouchableOpacity onPress={onClose}>
            <Ionicons
              name="close"
              size={24}
              color={isDark ? "#FEFCFA" : "#3A2E2C"}
            />
          </TouchableOpacity>
          <Text
            className={`${isDark ? "text-dark-text" : "text-light-text"} text-lg font-semibold`}
          >
            Informations produit
          </Text>
          <View style={{ width: 20 }} />
        </View>

        <ScrollView
          className="p-4"
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            if (y > 8 && !headerSolid) setHeaderSolid(true);
            else if (y <= 8 && headerSolid) setHeaderSolid(false);
          }}
          scrollEventThrottle={16}
        >
          {/* Product Image */}
          <View className="items-center mb-4">
            <Image
              source={product.image}
              style={{ width: 128, height: 128, borderRadius: 12 }}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={100}
            />
          </View>

          {/* Product Title */}
          <Text
            className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-2xl font-bold text-center mb-2`}
          >
            {product.name}
          </Text>

          {/* Slogan */}
          <Text
            className={`${isDark ? "text-dark-textSecondary" : "text-light-text-secondary"} text-center mb-6 italic`}
          >
            Découvrez notre sélection premium
          </Text>

          {/* Allergens Section */}
          <ExpandableSection title="Allergènes" isDark={isDark}>
            <View className="mb-4">
              {product.allergens && product.allergens.length > 0 ? (
                product.allergens.map((allergen, index) => (
                  <View key={index} className="py-2">
                    <Text
                      className={`${isDark ? "text-dark-textSecondary" : "text-light-text-secondary"} text-base`}
                    >
                      {allergen}
                    </Text>
                    {/* Separator uniquement si ce n'est pas le dernier */}
                    {index < product.allergens.length - 1 && (
                      <View className="mt-2" />
                    )}
                    {index < product.allergens.length - 1 && (
                      <Separator borderColor={borderColor} />
                    )}
                  </View>
                ))
              ) : (
                <Text
                  className={`${isDark ? "text-dark-textSecondary" : "text-light-text-secondary"} text-base italic`}
                >
                  Aucun allergène connu
                </Text>
              )}
            </View>
          </ExpandableSection>

          {/* Separator plein entre sections */}
          <View
            style={{
              width: "100%",
              height: 1,
              backgroundColor: borderColor,
              opacity: 1,
            }}
          />

          {/* Nutritional Values Section */}
          <ExpandableSection
            title="Valeurs nutritionnelles et Nutri-score"
            isDark={isDark}
          >
            <View className="mb-4">
              <View className="py-2">
                <View className="flex-row justify-between items-center">
                  <Text
                    className={`${isDark ? "text-dark-textSecondary" : "text-light-text-secondary"} text-base`}
                  >
                    Calories
                  </Text>
                  <Text
                    className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-base font-semibold`}
                  >
                    {product.nutritionalValues.calories} kcal
                  </Text>
                </View>
                <View className="mt-2" />
                <Separator borderColor={borderColor} />
              </View>
              <View className="py-2">
                <View className="flex-row justify-between items-center">
                  <Text
                    className={`${isDark ? "text-dark-textSecondary" : "text-light-text-secondary"} text-base`}
                  >
                    Protéines
                  </Text>
                  <Text
                    className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-base font-semibold`}
                  >
                    {product.nutritionalValues.protein}g
                  </Text>
                </View>
                <View className="mt-2" />
                <Separator borderColor={borderColor} />
              </View>
              <View className="py-2">
                <View className="flex-row justify-between items-center">
                  <Text
                    className={`${isDark ? "text-dark-textSecondary" : "text-light-text-secondary"} text-base`}
                  >
                    Glucides
                  </Text>
                  <Text
                    className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-base font-semibold`}
                  >
                    {product.nutritionalValues.carbs}g
                  </Text>
                </View>
                <View className="mt-2" />
                <Separator borderColor={borderColor} />
              </View>
              <View className="py-2">
                <View className="flex-row justify-between items-center">
                  <Text
                    className={`${isDark ? "text-dark-textSecondary" : "text-light-text-secondary"} text-base`}
                  >
                    Lipides
                  </Text>
                  <Text
                    className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-base font-semibold`}
                  >
                    {product.nutritionalValues.fat}g
                  </Text>
                </View>
                <View className="mt-2" />
              </View>
            </View>
          </ExpandableSection>
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
}
