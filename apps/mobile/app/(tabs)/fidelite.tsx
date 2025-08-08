import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { useTailwindTheme } from "../../hooks/useTailwindTheme";
import { useGradient } from "../../hooks/useGradient";
import { GradientText } from "../../components/ui/GradientText";
import { GradientProgressBar } from "../../components/ui/GradientProgressBar";
import { Header } from "../../components/Header";
import BarcodeIcon from "../../assets/images/barcode_icon.svg";
import PlusIcon from "../../assets/images/plus.svg";

// Types pour les données
interface Advantage {
  id: string;
  title: string;
  description?: string;
  points: number;
  image: string;
}

interface HistoryEntry {
  id: string;
  date: string;
  location: string;
  points: number;
}

// Données mockées
const mockPoints = 100; // ou 50 selon l'état
// Mapping des images pour React Native
const imageMapping = {
  "ptit_duo.png": require("../../assets/images/ptit_duo.png"),
  "le_gourmand.png": require("../../assets/images/le_gourmand.png"),
  "le_mix_parfait.png": require("../../assets/images/le_mix_parfait.png"),
};

const mockAdvantages: Advantage[] = [
  {
    id: "1",
    title: "Petit snack",
    points: 20,
    image: "ptit_duo.png",
  },
  {
    id: "2",
    title: "Gros snack",
    points: 40,
    image: "le_gourmand.png",
  },
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
];

export default function FideliteScreen() {
  const { isDark, colors } = useTailwindTheme();
  const { gradientColors, textGradientColors } = useGradient();
  const [activeTab, setActiveTab] = useState<"advantages" | "history">(
    "advantages"
  );
  const [showBarcode, setShowBarcode] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Bottom sheet refs and snap points
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%", "90%"], []);

  // Callbacks
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setShowBarcode(false);
    }
  }, []);

  const handleClosePress = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

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

  const renderProgressBar = () => {
    const progress = (mockPoints / 100) * 100;

    return (
      <View className="mb-2 px-4">
        <View style={{ marginBottom: 8 }}>
          <GradientText
            colors={textGradientColors}
            style={{ fontSize: 32, fontWeight: "bold" }}
          >
            {`${mockPoints} points`}
          </GradientText>
        </View>
        <GradientProgressBar
          progress={progress}
          colors={gradientColors}
          height={12}
        />
      </View>
    );
  };

  const renderBarcodeButton = () => (
    <TouchableOpacity
      onPress={() => setShowBarcode(true)}
      className={`${
        isDark ? "bg-dark-secondary" : "bg-light-secondary"
      } rounded-lg px-6 py-3 mb-6 flex-row items-center justify-center gap-2 mx-4`}
    >
      <BarcodeIcon width={24} height={24} fill={colors.buttonText} />
      <Text
        className={`${
          isDark ? "text-dark-buttonText" : "text-light-buttonText"
        } text-lg font-medium`}
      >
        Mon identifiant
      </Text>
    </TouchableOpacity>
  );

  const renderTabs = () => (
    <View
      className={`${isDark ? "bg-dark-border" : "bg-light-border"} mb-6 flex-row items-center`}
    >
      <TouchableOpacity
        onPress={() => setActiveTab("advantages")}
        className={`px-6 w-1/2 py-5 flex-row items-center justify-center gap-2 relative`}
      >
        <Text
          className={`${isDark ? "text-dark-text" : "text-light-text"} text-lg ${
            activeTab === "advantages" ? "font-bold" : "font-medium"
          }`}
        >
          Mes avantages
        </Text>
        {activeTab === "advantages" && (
          <View
            className={`absolute bottom-0 left-0 right-0 h-1 mx-2 rounded-full ${
              isDark ? "bg-dark-secondary" : "bg-light-secondary"
            }`}
          />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setActiveTab("history")}
        className={`px-6 w-1/2 py-5 flex-row items-center justify-center gap-2 relative`}
      >
        <Text
          className={`${isDark ? "text-dark-text" : "text-light-text"} text-lg ${
            activeTab === "history" ? "font-bold" : "font-medium"
          }`}
        >
          Mon historique
        </Text>
        {activeTab === "history" && (
          <View
            className={`absolute bottom-0 left-0 right-0 h-1 mx-2 rounded-full ${
              isDark ? "bg-dark-secondary" : "bg-light-secondary"
            }`}
          />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderAdvantages = () => (
    <View className="px-4">
      {/* Première ligne avec 2 cards */}
      <View className="flex-row gap-4 mb-4">
        {mockAdvantages.slice(0, 2).map((advantage) => (
          <TouchableOpacity
            key={advantage.id}
            className={`flex-1 ${isDark ? "bg-dark-border" : "bg-light-border"} rounded-lg p-4`}
          >
            <View className="items-start">
              <Image
                source={
                  imageMapping[advantage.image as keyof typeof imageMapping]
                }
                style={{
                  width: 120,
                  height: 120,
                  marginBottom: 12,
                  alignSelf: "center",
                }}
                contentFit="contain"
                cachePolicy="memory-disk"
                transition={200}
              />
              <Text
                className={`${isDark ? "text-dark-text" : "text-light-text"} text-xl text-center mb-1`}
              >
                {advantage.title}
              </Text>
              <Text
                className={`${isDark ? "text-dark-text" : "text-light-text"} font-extrabold text-base mb-3`}
              >
                {advantage.points} points
              </Text>
              <View className="w-8 h-8 rounded-full self-end items-center justify-center">
                <PlusIcon
                  width={24}
                  height={24}
                  color={isDark ? "#FEFCFA" : "#3A2E2C"}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cards individuelles pour les autres éléments */}
      {mockAdvantages.slice(2).map((advantage) => (
        <TouchableOpacity
          key={advantage.id}
          className={`${isDark ? "bg-dark-border" : "bg-light-border"} rounded-lg px-4 py-8 mb-4`}
        >
          <View className="flex-row items-center">
            <Image
              source={
                imageMapping[advantage.image as keyof typeof imageMapping]
              }
              style={{ width: 120, height: 120, marginRight: 12 }}
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={200}
            />

            <View className="flex-col items-start flex-1 gap-8">
              <View className="flex-col items-start">
                <Text
                  className={`${isDark ? "text-dark-text" : "text-light-text"} text-xl text-center mb-1`}
                >
                  {advantage.title}
                </Text>
                {advantage.description && (
                  <Text
                    className={`${isDark ? "text-dark-textSecondary" : "text-light-textSecondary"} text-sm`}
                  >
                    {advantage.description}
                  </Text>
                )}
                <Text
                  className={`${isDark ? "text-dark-text" : "text-light-text"} font-extrabold text-base mb-3`}
                >
                  {advantage.points} points
                </Text>
              </View>
              <View className="self-end">
                <View className="w-8 h-8 rounded-full self-end items-center justify-center">
                  <PlusIcon
                    width={24}
                    height={24}
                    color={isDark ? "#FEFCFA" : "#3A2E2C"}
                  />
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderHistory = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {mockHistory.map((entry) => (
        <View
          key={entry.id}
          className={`${isDark ? "bg-dark-surface" : "bg-light-surface"} rounded-lg p-4 mb-3`}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text
                className={`${isDark ? "text-dark-text" : "text-light-text"} font-medium`}
              >
                {entry.date} Commande aux bornes
              </Text>
              <Text
                className={`${isDark ? "text-dark-textSecondary" : "text-light-textSecondary"} text-sm`}
              >
                {entry.location}
              </Text>
            </View>
            <View
              className={`${isDark ? "bg-dark-secondary" : "bg-light-secondary"} rounded-full px-3 py-1 border ${isDark ? "border-dark-secondary" : "border-light-secondary"}`}
            >
              <Text className="text-white font-bold">
                +{entry.points} points
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderBarcodeBottomSheet = () => {
    const { width, height } = Dimensions.get("window");
    const isLandscape = width > height;
    const imageHeight = isLandscape ? height * 0.4 : height * 0.3;

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={showBarcode ? 1 : -1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={{
          backgroundColor: isDark ? "#6B7280" : "#9CA3AF",
          width: 40,
          height: 4,
        }}
        backgroundStyle={{
          backgroundColor: isDark ? "#2C2221" : "#F9F4EC", // Utilise les couleurs background du thème
        }}
      >
        <BottomSheetView className="flex-1">
          {/* Header avec titre et croix */}
          <View className="flex-row items-center px-6 mb-6">
            <TouchableOpacity
              onPress={handleClosePress}
              className="w-8 h-8 items-center justify-center"
            >
              <Text
                className={`${
                  isDark ? "text-dark-text" : "text-light-text"
                } text-2xl font-bold`}
              >
                ×
              </Text>
            </TouchableOpacity>
            <Text
              className={`${
                isDark ? "text-dark-text" : "text-light-text"
              } text-xl font-bold text-center flex-1`}
            >
              Mon identifiant
            </Text>
            <View className="w-8" />
          </View>

          {/* Contenu du code-barres */}
          <View className="flex-1 px-6 pb-6">
            <View
              className={`${
                isDark ? "bg-dark-border" : "bg-light-border"
              } rounded-lg items-center justify-center flex-1`}
              style={{ padding: 20 }}
            >
              <Image
                source={require("../../assets/images/barcode.jpg")}
                style={{
                  width: "100%",
                  height: imageHeight,
                }}
                contentFit="contain"
                cachePolicy="memory-disk"
                transition={200}
              />
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  };

  return (
    <View
      className={`${isDark ? "bg-dark-background" : "bg-light-background"} flex-1`}
    >
      <Header title="Mon programme" scrollY={scrollY} />

      <Animated.ScrollView
        className="flex-1 mb-24"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <Text
          className={`${isDark ? "text-dark-text" : "text-light-text"} text-5xl font-bold mb-6 px-4`}
        >
          Mon programme
        </Text>

        {renderProgressBar()}
        {renderBarcodeButton()}
        {renderTabs()}

        {activeTab === "advantages" ? renderAdvantages() : renderHistory()}
      </Animated.ScrollView>

      {renderBarcodeBottomSheet()}
    </View>
  );
}
