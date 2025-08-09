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
import { Advantage, HistoryEntry } from "../../types/types";
import { AdvantageGrid, HistoryList } from "../../components/fidelity";
import { useRouter } from "expo-router";
import { useCart } from "../../contexts/CartContext";

const CartBanner = React.lazy(() => import("../../components/CartBanner"));

// Les points affichés proviennent maintenant du CartContext (getCurrentPoints)

const mockAdvantages: Advantage[] = [
  { id: "1", title: "Petit snack", points: 20, image: "ptit_duo.png" },
  { id: "2", title: "Gros snack", points: 40, image: "le_gourmand.png" },
  {
    id: "3",
    title: "Le p'tit duo",
    description: "Choisissez deux petits snacks",
    points: 35,
    image: "ptit_duo.png",
  },
  {
    id: "4",
    title: "Le Mix Parfait",
    description: "Choisissez un petit snack et un gros snack",
    points: 55,
    image: "le_mix_parfait.png",
  },
  {
    id: "5",
    title: "Le gourmand",
    description: "Choisissez deux gros snacks",
    points: 70,
    image: "le_gourmand.png",
  },
];

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
              advantages={mockAdvantages}
              // Navigation vers l'écran de détail d'offre
              onPress={(adv) => {
                // Map du titre vers une clé stable
                const key = adv.title.toLowerCase().includes("petit snack")
                  ? "petit_snack"
                  : adv.title.toLowerCase().includes("gros snack")
                    ? "gros_snack"
                    : adv.title.toLowerCase().includes("p'tit duo") ||
                        adv.title.toLowerCase().includes("ptit duo")
                      ? "ptit_duo"
                      : adv.title.toLowerCase().includes("mix")
                        ? "mix_parfait"
                        : "gourmand";
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
