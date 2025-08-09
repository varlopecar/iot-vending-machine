import React, { useState, useCallback, useMemo, useRef } from "react";
import { View, Animated } from "react-native";
import BottomSheet from "@gorhom/bottom-sheet";
import { useTailwindTheme } from "../../hooks/useTailwindTheme";
import { useGradient } from "../../hooks/useGradient";
import { Header } from "../../components/Header";
import {
  PointsProgress,
  SectionTitle,
  Tabs,
  BarcodeButton,
  BottomSheetBarcode,
  SafeContainer,
} from "../../components/ui";
import { HistoryEntry } from "../../types/types";
import { AdvantageGrid, HistoryList } from "../../components/fidelity";
import { useRouter } from "expo-router";
import { useCart } from "../../contexts/CartContext";
import {
  getAdvantagesFromOffers,
  getOfferKeyFromTitle,
} from "../../lib/offers/advantageSync";

const CartBanner = React.lazy(() => import("../../components/CartBanner"));

// Les points affichés proviennent maintenant du CartContext (getCurrentPoints)

// Les avantages sont maintenant générés à partir de la configuration centralisée
const advantages = getAdvantagesFromOffers();

const mockHistory: HistoryEntry[] = [
  { id: "1", date: "04/08/2025", location: "Sophia", points: 2 },
  { id: "2", date: "02/09/2025", location: "Antibes", points: 4 },
  { id: "3", date: "02/09/2025", location: "Antibes", points: 4 },
  { id: "4", date: "02/09/2025", location: "Antibes", points: 4 },
  { id: "5", date: "02/09/2025", location: "Antibes", points: 4 },
  { id: "6", date: "02/09/2025", location: "Antibes", points: 4 },
  { id: "7", date: "02/09/2025", location: "Antibes", points: 4 },
  { id: "8", date: "02/09/2025", location: "Antibes", points: 4 },
  { id: "9", date: "02/09/2025", location: "Antibes", points: 4 },
];

export default function FideliteScreen() {
  const { isDark, colors } = useTailwindTheme();
  const { gradientColors, textGradientColors } = useGradient();
  const [activeTab, setActiveTab] = useState<"advantages" | "history">(
    "advantages"
  );
  const [showBarcode, setShowBarcode] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { getCurrentPoints, getTotalItems, getTotalPrice } = useCart();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%", "90%"], []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) setShowBarcode(false);
  }, []);

  const handleClosePress = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const navigateToCart = () => {
    router.push("/panier");
  };

  return (
    <SafeContainer>
      <View
        className={`${isDark ? "bg-dark-background" : "bg-light-background"} flex-1`}
      >
        <Header title="Mon programme" scrollY={scrollY} />

        <Animated.ScrollView
          className="flex-1"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          <SectionTitle isDark={isDark}>Mon programme</SectionTitle>

          <PointsProgress
            points={getCurrentPoints()}
            textGradientColors={textGradientColors}
            barGradientColors={gradientColors}
          />

          <BarcodeButton
            isDark={isDark}
            onPress={() => setShowBarcode(true)}
            buttonTextColor={colors.buttonText ?? "#FFFFFF"}
          />

          <Tabs
            isDark={isDark}
            active={activeTab}
            options={[
              { key: "advantages", label: "Mes avantages" },
              { key: "history", label: "Mon historique" },
            ]}
            onChange={(key) => setActiveTab(key as "advantages" | "history")}
          />

          {activeTab === "advantages" ? (
            <AdvantageGrid
              isDark={isDark}
              advantages={advantages}
              // Navigation vers l'écran de détail d'offre
              onPress={(adv) => {
                const key = getOfferKeyFromTitle(adv.title);
                router.push({
                  pathname: "/offres/[offer]",
                  params: { offer: key },
                } as any);
              }}
            />
          ) : (
            <HistoryList
              isDark={isDark}
              entries={mockHistory}
              gradientColors={gradientColors}
            />
          )}
        </Animated.ScrollView>

        {/* Cart Banner */}
        <React.Suspense fallback={<View className="h-20" />}>
          <CartBanner
            itemCount={getTotalItems()}
            totalPrice={getTotalPrice()}
            onPress={navigateToCart}
          />
        </React.Suspense>

        <BottomSheetBarcode
          isDark={isDark}
          bottomSheetRef={bottomSheetRef}
          index={showBarcode ? 1 : -1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          onClosePress={handleClosePress}
        />
      </View>
    </SafeContainer>
  );
}
