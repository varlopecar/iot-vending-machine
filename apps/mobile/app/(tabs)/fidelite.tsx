import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { useTailwindTheme } from "../../hooks/useTailwindTheme";
import { useGradient } from "../../hooks/useGradient";
import { GradientText } from "../../components/GradientText";
import { GradientProgressBar } from "../../components/GradientProgressBar";

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
const mockAdvantages: Advantage[] = [
  {
    id: "1",
    title: "Petit snack",
    points: 20,
    image: "🥤🍶",
  },
  {
    id: "2",
    title: "Gros snack",
    points: 40,
    image: "🍟🍫",
  },
  {
    id: "3",
    title: "Le p'tit duo",
    description: "Choisissez deux petits snacks",
    points: 35,
    image: "🥤🍶",
  },
  {
    id: "4",
    title: "Le Mix Parfait",
    description: "Choisissez un petit snack et un gros snack",
    points: 55,
    image: "🍫🥤",
  },
  {
    id: "5",
    title: "Le gourmand",
    description: "Choisissez deux gros snacks",
    points: 70,
    image: "🍟🍫",
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
  const { isDark } = useTailwindTheme();
  const { gradientColors, textGradientColors } = useGradient();
  const [activeTab, setActiveTab] = useState<"advantages" | "history">(
    "advantages"
  );
  const [showBarcode, setShowBarcode] = useState(false);

  const renderProgressBar = () => {
    const progress = (mockPoints / 100) * 100;

    return (
      <View className="mb-6">
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
      className="bg-pink-400 rounded-lg px-6 py-3 mb-6 flex-row items-center justify-center"
    >
      <Text className="text-white text-lg mr-2">📱</Text>
      <Text className="text-white text-lg font-medium">Mon identifiant</Text>
    </TouchableOpacity>
  );

  const renderTabs = () => (
    <View className="flex-row bg-gray-700 rounded-lg p-1 mb-6">
      <TouchableOpacity
        onPress={() => setActiveTab("advantages")}
        className={`flex-1 py-3 px-4 rounded-md ${
          activeTab === "advantages" ? "bg-pink-400" : "bg-transparent"
        }`}
      >
        <Text
          className={`text-center font-medium ${
            activeTab === "advantages" ? "text-white" : "text-gray-300"
          }`}
        >
          Mes avantages
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setActiveTab("history")}
        className={`flex-1 py-3 px-4 rounded-md ${
          activeTab === "history" ? "bg-pink-400" : "bg-transparent"
        }`}
      >
        <Text
          className={`text-center font-medium ${
            activeTab === "history" ? "text-white" : "text-gray-300"
          }`}
        >
          Mon historique
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderAdvantages = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {mockAdvantages.map((advantage) => (
        <View key={advantage.id} className="bg-gray-700 rounded-lg p-4 mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text className="text-2xl mr-3">{advantage.image}</Text>
                <View className="flex-1">
                  <Text className="text-white text-lg font-medium">
                    {advantage.title}
                  </Text>
                  {advantage.description && (
                    <Text className="text-gray-300 text-sm">
                      {advantage.description}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            <View className="flex-row items-center">
              <Text className="text-white font-bold text-lg mr-3">
                {advantage.points} points
              </Text>
              <TouchableOpacity className="bg-purple-500 w-8 h-8 rounded-full items-center justify-center">
                <Text className="text-white text-xl font-bold">+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderHistory = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {mockHistory.map((entry) => (
        <View key={entry.id} className="bg-gray-700 rounded-lg p-4 mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white font-medium">
                {entry.date} Commande aux bornes
              </Text>
              <Text className="text-gray-300 text-sm">{entry.location}</Text>
            </View>
            <View className="bg-pink-400 rounded-full px-3 py-1 border border-pink-300">
              <Text className="text-white font-bold">
                +{entry.points} points
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderBarcodeModal = () => (
    <Modal
      visible={showBarcode}
      transparent
      animationType="slide"
      onRequestClose={() => setShowBarcode(false)}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-end"
        onPress={() => setShowBarcode(false)}
      >
        <View className="bg-gray-800 rounded-t-3xl p-6">
          <View className="w-12 h-1 bg-gray-600 rounded-full self-center mb-6" />
          <Text className="text-white text-xl font-bold text-center mb-6">
            Mon identifiant
          </Text>
          <View className="bg-white p-8 rounded-lg items-center mb-6">
            <Text className="text-black text-2xl font-mono">
              |||| |||| |||| |||| |||| ||||
            </Text>
            <Text className="text-black text-lg font-mono mt-2">
              1234567890123456
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowBarcode(false)}
            className="bg-pink-400 rounded-lg py-3"
          >
            <Text className="text-white text-center font-medium">Fermer</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <View className="bg-gray-900 flex-1">
      <ScrollView className="flex-1 px-4 pt-12">
        <Text className="text-white text-3xl font-bold mb-6">
          Mon programme
        </Text>

        {renderProgressBar()}
        {renderBarcodeButton()}
        {renderTabs()}

        {activeTab === "advantages" ? renderAdvantages() : renderHistory()}
      </ScrollView>

      {renderBarcodeModal()}
    </View>
  );
}
