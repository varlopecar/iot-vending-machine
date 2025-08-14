import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { PaymentQRView } from "../components/PaymentQRView";
import { CheckoutGetStatusResponse } from "../types/stripe";
import { useCart } from "../contexts/CartContext";
import { useTailwindTheme } from "../hooks/useTailwindTheme";
import { getOrderById as getOrderByIdApi, createOrder } from "../lib/orders";
import { getAllProducts } from "../lib/products";
import { getStockByMachineAndProduct } from "../lib/stocks";
import { resolveServerProductId } from "../lib/productMapping";

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDark } = useTailwindTheme();
  const { cartItems, getTotalPrice, clearCart } = useCart();

  const [orderStatus, setOrderStatus] =
    useState<CheckoutGetStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderIdState, setOrderIdState] = useState<string | undefined>(params.orderId as string | undefined);
  type StepStatus = 'idle' | 'pending' | 'done' | 'skip' | 'error';
  const [createOrderStep, setCreateOrderStep] = useState<StepStatus>('idle');
  const [fetchQrStep, setFetchQrStep] = useState<StepStatus>('idle');

  // Récupérer le QR code réel depuis le backend pour l'orderId
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        const rawAmount = Number(params.amount as string);
        const currency = (params.currency as string) || "eur";

        // Si l'orderId n'existe pas encore, créer la commande maintenant (après paiement réussi)
        const userId = params.userId as string | undefined;
        const machineId = params.machineId as string | undefined;
        let orderId = orderIdState;

        if (!orderId) {
          setCreateOrderStep('pending');
          if (!userId || !machineId) throw new Error('Paramètres manquants pour créer la commande');
          // Construire les items à partir du panier courant
          const serverProducts = await getAllProducts();
          const items: { product_id: string; quantity: number; slot_number: number }[] = [];
          for (const ci of cartItems) {
            const serverId = resolveServerProductId(serverProducts, ci.name);
            if (!serverId) throw new Error(`Produit introuvable: ${ci.name}`);
            const stock = await getStockByMachineAndProduct(machineId, serverId);
            if (!stock) throw new Error(`Stock indisponible pour ${ci.name}`);
            items.push({ product_id: serverId, quantity: ci.quantity, slot_number: stock.slot_number });
          }
          const created = await createOrder({ user_id: userId, machine_id: machineId, items });
          orderId = created.id;
          setOrderIdState(orderId);
          setCreateOrderStep('done');
        } else {
          setCreateOrderStep('skip');
        }

        // Charger la commande réelle (créée ou existante) avec retry car création + latence DB
        async function getWithRetry(id: string, retries = 3, delayMs = 400): Promise<ReturnType<typeof getOrderByIdApi>> {
          for (let i = 0; i < retries; i++) {
            try {
              // @ts-ignore
              return await getOrderByIdApi(id);
            } catch (e: any) {
              if (i === retries - 1) throw e;
              await new Promise((r) => setTimeout(r, delayMs));
            }
          }
          // @ts-ignore
          return await getOrderByIdApi(id);
        }
        setFetchQrStep('pending');
        const order = await getWithRetry(orderId as string);
        setFetchQrStep('done');

        const status: CheckoutGetStatusResponse = {
          orderStatus: "PAID",
          paymentStatus: "succeeded",
          paidAt: new Date().toISOString(),
          receiptUrl: null,
          amountTotalCents: Number.isFinite(rawAmount) ? rawAmount : 0,
          currency,
          qrCodeToken: order.qr_code_token,
          stripePaymentIntentId: ((params.paymentIntentId as string) || null) as string | null,
        };

        if (!cancelled) setOrderStatus(status);

        // Vider le panier une fois la commande confirmée
        clearCart();
      } catch (e) {
        console.error("[PaymentSuccess] Erreur chargement order:", e);
        if (createOrderStep === 'pending') setCreateOrderStep('error');
        if (fetchQrStep === 'pending') setFetchQrStep('error');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    // Toujours tenter de charger (avec ou sans orderId initial)
    load();
    return () => {
      cancelled = true;
    };
  }, [params.userId, params.machineId, params.amount, params.currency]);

  const handleRefreshStatus = async () => {
    try {
      setIsLoading(true);
      setFetchQrStep('pending');
      const order = await getOrderByIdApi((orderIdState as string));
      const rawAmount = Number(params.amount as string);
      const currency = (params.currency as string) || 'eur';
      setOrderStatus({
        orderStatus: 'PAID',
        paymentStatus: 'succeeded',
        paidAt: new Date().toISOString(),
        receiptUrl: null,
        amountTotalCents: Number.isFinite(rawAmount) ? rawAmount : 0,
        currency,
        qrCodeToken: order.qr_code_token,
        stripePaymentIntentId: ((params.paymentIntentId as string) || null) as string | null,
      });
      setFetchQrStep('done');
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
      Alert.alert(
        "Erreur",
        "Impossible de mettre à jour le statut de la commande.",
        [{ text: "OK" }]
      );
      setIsLoading(false);
      setFetchQrStep('error');
    }
  };

  const handleGoToHome = () => {
    router.dismissAll();
    router.push("/(tabs)");
  };

  if (isLoading || !orderStatus) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
        <View className="flex-1 justify-center items-center p-6">
          <View className={`w-16 h-16 rounded-full justify-center items-center mb-4 ${isDark ? 'bg-dark-secondary' : 'bg-green-100'}`}>
            <Text className="text-2xl">✅</Text>
          </View>
          <Text className={`text-xl font-bold mb-2 ${isDark ? 'text-dark-textSecondary' : 'text-light-text'}`}>
            Paiement confirmé !
          </Text>
          <View className="mt-4 mb-2 w-full max-w-md">
            <Text className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'} text-base mb-1`}>
              • Création de la commande: {createOrderStep === 'pending' ? 'en cours…' : createOrderStep === 'done' ? 'terminée' : createOrderStep === 'skip' ? 'déjà créée' : createOrderStep === 'error' ? 'erreur' : '—'}
            </Text>
            <Text className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'} text-base`}>
              • Récupération du QR code: {fetchQrStep === 'pending' ? 'en cours…' : fetchQrStep === 'done' ? 'terminée' : fetchQrStep === 'error' ? 'erreur' : '—'}
            </Text>
          </View>
          <Text className={`text-center mt-2 ${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'}`}>
            Génération de votre QR code en cours...
          </Text>
          <View className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mt-4 ${isDark ? 'border-dark-secondary' : 'border-green-500'}`} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
      <PaymentQRView
        qrCodeToken={orderStatus.qrCodeToken || ""}
        orderId={(orderIdState as string)}
        orderStatus={orderStatus}
        onRefreshStatus={handleRefreshStatus}
      />

      {/* Bouton retour à l'accueil */}
      <View className={`p-6 border-t ${isDark ? 'border-dark-textSecondary' : 'border-gray-200'}`}>
        <TouchableOpacity
          className={`${isDark ? 'bg-dark-secondary' : 'bg-light-secondary'} rounded-xl py-4 px-6`}
          onPress={handleGoToHome}
          activeOpacity={0.8}
        >
          <Text className={`font-semibold text-center text-base ${isDark ? 'text-dark-buttonText' : 'text-white'}`}>
            Retour à l'accueil
          </Text>
        </TouchableOpacity>


      </View>
    </SafeAreaView>
  );
}
