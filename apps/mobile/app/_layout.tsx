import "../global.css";
import { Stack } from "expo-router";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CartProvider } from "../contexts/CartContext";
import * as Notifications from "expo-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StripeProvider } from "@stripe/stripe-react-native";

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  return (
    <StripeProvider
      publishableKey="pk_test_51RvIdAHfSJ4cJF2RtcO2KwkhkyQ4igfsDhLiD1aaLEcC0TPOgUoCkXiH727zgTcDabsgqoTCMSbHWeaSGRULWrT200l1OkHj5X" // Remplacez par votre clé publique Stripe
      merchantIdentifier="merchant.com.votreentreprise.vending" // iOS uniquement
      urlScheme="your-app-scheme" // iOS uniquement
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <CartProvider>
            <Stack screenOptions={{ headerBackTitle: "" }}>
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={{ headerShown: false }} />
              <Stack.Screen
                name="(tabs)"
                options={{ headerShown: false, title: "" }}
              />
              <Stack.Screen
                name="offres/[offer]"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="+not-found" />
              <Stack.Screen
                name="checkout"
                options={{
                  headerShown: true,
                  title: "Paiement",
                  presentation: "modal",
                }}
              />
              <Stack.Screen
                name="payment-success"
                options={{
                  headerShown: false,
                  presentation: "modal",
                }}
              />
            </Stack>
          </CartProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </StripeProvider>
  );
}
