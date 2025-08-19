import "../global.css";
import { Stack } from "expo-router";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { CartProvider } from "../contexts/CartContext";
import { OrdersProvider } from "../contexts/OrdersContext";
import { MachineProvider } from "../contexts/MachineContext";
import { AuthProvider } from "../contexts/AuthContext";
import * as Notifications from "expo-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StripeProvider } from "../components/StripeProvider";

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
    <StripeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AuthProvider>
            <MachineProvider>
            <CartProvider>
              <OrdersProvider>
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
              </OrdersProvider>
            </CartProvider>
            </MachineProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </StripeProvider>
  );
}
