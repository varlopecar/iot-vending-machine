import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { CheckoutScreen } from "./CheckoutScreen";
import { useStripeContext } from "./StripeProvider";

export const StripeTestScreen: React.FC = () => {
  const { publishableKey, isLoading, error, refreshKey } = useStripeContext();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg text-gray-600">Chargement de Stripe...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <Text className="text-xl font-bold text-red-600 mb-4">
          Erreur Stripe
        </Text>
        <Text className="text-gray-600 text-center mb-6">{error}</Text>
        <TouchableOpacity
          onPress={refreshKey}
          className="bg-blue-500 px-6 py-3 rounded-full"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-base">Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        {/* En-tête */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Test d'intégration Stripe
          </Text>
          <Text className="text-gray-600">
            Vérifiez que l'intégration Stripe fonctionne correctement
          </Text>
        </View>

        {/* Statut Stripe */}
        <View className="mb-8 p-4 bg-green-50 rounded-xl border border-green-200">
          <Text className="text-lg font-semibold text-green-800 mb-2">
            ✅ Stripe initialisé
          </Text>
          <Text className="text-sm text-green-700">
            Clé : {publishableKey?.slice(0, 20)}...
          </Text>
        </View>

        {/* Instructions de test */}
        <View className="mb-8 p-4 bg-blue-50 rounded-xl">
          <Text className="text-lg font-semibold text-blue-800 mb-3">
            🧪 Comment tester
          </Text>
          <Text className="text-sm text-blue-700 mb-2">
            1. Utilisez une carte de test Stripe
          </Text>
          <Text className="text-sm text-blue-700 mb-2">
            2. Testez les scénarios d'erreur
          </Text>
          <Text className="text-sm text-blue-700 mb-2">
            3. Vérifiez le polling et l'affichage du QR
          </Text>
          <Text className="text-sm text-blue-700">
            4. Testez la gestion des erreurs
          </Text>
        </View>

        {/* Cartes de test */}
        <View className="mb-8 p-4 bg-yellow-50 rounded-xl">
          <Text className="text-lg font-semibold text-yellow-800 mb-3">
            💳 Cartes de test Stripe
          </Text>
          <Text className="text-sm text-yellow-700 mb-2">
            Succès : 4242 4242 4242 4242
          </Text>
          <Text className="text-sm text-yellow-700 mb-2">
            3DS : 4000 0025 0000 3155
          </Text>
          <Text className="text-sm text-yellow-700 mb-2">
            Échec : 4000 0000 0000 0002
          </Text>
          <Text className="text-sm text-yellow-700">
            Date : 12/25, CVC : 123
          </Text>
        </View>

        {/* Test du checkout */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Test du processus de checkout
          </Text>
          <CheckoutScreen
            orderId="test-order-123"
            onSuccess={() => {
              console.log("Paiement réussi !");
            }}
            onError={(error) => {
              console.error("Erreur de paiement:", error);
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
};
