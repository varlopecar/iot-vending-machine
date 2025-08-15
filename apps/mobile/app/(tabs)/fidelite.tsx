import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
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
import { useAuth } from "../../contexts/AuthContext";
import { getLoyaltyHistory } from "../../lib/loyalty";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCart } from "../../contexts/CartContext";
import {
  getAdvantagesFromOffers,
  getOfferKeyFromTitle,
} from "../../lib/offers/advantageSync";
import SuccessBanner from "../../components/SuccessBanner";

const CartBanner = React.lazy(() => import("../../components/CartBanner"));

// Les avantages sont générés à partir de la configuration centralisée
const advantages = getAdvantagesFromOffers();

export default function FideliteScreen() {
  const { isDark, colors } = useTailwindTheme();
  const { user } = useAuth();
  const { gradientColors, textGradientColors } = useGradient();
  const [activeTab, setActiveTab] = useState<"advantages" | "history">(
    "advantages"
  );
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showBarcode, setShowBarcode] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const {
    getCurrentPoints,
    refreshUserPoints,
    getTotalItems,
    getTotalPrice,
    lastOfferAdded,
    clearLastOfferAdded,
  } = useCart();

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

  const navigateToCartFromBanner = () => {
    setShowSuccessBanner(false);
    router.push("/panier");
  };

  // Détecter quand une offre a été ajoutée et afficher la notification
  useEffect(() => {
    if (lastOfferAdded) {
      setShowSuccessBanner(true);
      // Après l'affichage, on peut nettoyer
      setTimeout(() => {
        clearLastOfferAdded();
      }, 2500); // Un peu plus que la durée de la notification
    }
  }, [lastOfferAdded, clearLastOfferAdded]);

  // Rafraîchir les points à chaque focus de l'onglet Fidélité
  useFocusEffect(
    useCallback(() => {
      void refreshUserPoints();
      // Charger l'historique fidélité
      if (user?.id) {
        getLoyaltyHistory(user.id)
          .then((entries) => {
            setHistory(entries);
          })
          .catch(() => setHistory([]));
      } else {
        setHistory([]);
      }
      return undefined;
    }, [refreshUserPoints, user?.id])
  );

  return (
    <SafeContainer>
      <View
        className={`${isDark ? "bg-dark-background" : "bg-light-background"} flex-1`}
      >
        {/* Bandeau de succès pour l'ajout d'offre */}
        <SuccessBanner
          visible={showSuccessBanner && !!lastOfferAdded}
          message={`L'offre ${lastOfferAdded} a été ajoutée au panier !`}
          onClose={() => setShowSuccessBanner(false)}
          onPress={navigateToCartFromBanner}
          autoHide={true}
          duration={2000}
        />

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
              entries={history}
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
          user={user}
        />
      </View>
    </SafeContainer>
  );
}
