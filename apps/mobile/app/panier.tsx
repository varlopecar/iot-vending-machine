import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useTailwindTheme } from "../hooks/useTailwindTheme";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useMachine } from "../contexts/MachineContext";
import { getAllProducts } from "../lib/products";
import { getStockByMachineAndProduct } from "../lib/stocks";
import { resolveServerProductId } from "../lib/productMapping";
// Création de commande déplacée après paiement (écran payment-success)

export default function CartScreen() {
  const { isDark } = useTailwindTheme();
  const router = useRouter();
  const { user, token } = useAuth();
  const { selectedMachineId } = useMachine();
  const [isGiftChecked, setIsGiftChecked] = useState(false);
  const {
    cartItems,
    appliedOffers,
    removeFromCart,
    // updateQuantity,
    getTotalPrice,
    removeOffer,
  } = useCart();

  const [errorModal, setErrorModal] = useState({ visible: false, title: '', message: '' });

  // Valide les stocks en agrégeant les quantités par produit (inclut les items offerts)
  const validateStockBeforeCheckout = async (machineId: string) => {
    try {
      const serverProducts = await getAllProducts();
      // Agrégation des quantités demandées par produit serveur
      const demandByServerId = new Map<string, { name: string; qty: number }>();
      for (const ci of cartItems) {
        const serverId = resolveServerProductId(serverProducts, ci.name);
        if (!serverId) {
          return {
            ok: false,
            message: `Produit introuvable: ${ci.name}`,
          } as const;
        }
        const entry = demandByServerId.get(serverId) || { name: ci.name, qty: 0 };
        entry.qty += ci.quantity;
        demandByServerId.set(serverId, entry);
      }

      for (const [serverId, { name, qty }] of demandByServerId.entries()) {
        const stock = await getStockByMachineAndProduct(machineId, serverId);
        const remaining = stock?.quantity ?? 0;
        if (remaining < qty) {
          const sRestant = remaining > 1 ? 'restants' : 'restant';
          const sDemande = qty > 1 ? 'demandés' : 'demandé';
          return {
            ok: false,
            message: `${name}: ${remaining} ${sRestant}, ${qty} ${sDemande}.`,
          } as const;
        }
      }
      return { ok: true } as const;
    } catch {
      return {
        ok: false,
        message: 'Validation du stock impossible. Réessayez.',
      } as const;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Panier",
          headerBackTitle: "",
          headerStyle: {
            backgroundColor: isDark ? "#493837" : "#E3E8E4",
          },
          headerTintColor: isDark ? "#FEFCFA" : "#3A2E2C",
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },
        }}
      />
      <View
        className={`${isDark ? "bg-dark-background" : "bg-light-background"} flex-1`}
      >
        <ScrollView className="flex-1 p-4">
          {/* Order Title */}
          <Text
            className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-2xl font-bold mb-8`}
          >
            Votre commande
          </Text>

          {/* Applied Offers */}
          {appliedOffers.length > 0 && (
            <View
              className={`${isDark ? "bg-dark-secondary" : "bg-light-secondary"} p-4 mb-8 mx-[-16px]`}
            >
              {appliedOffers.map((offer) => (
                <View key={offer.id} className="flex-row items-center mb-3">
                  <Ionicons
                    name="pricetag-outline"
                    size={24}
                    color={isDark ? "#320120" : "#FFFFFF"}
                    style={{ marginRight: 12 }}
                  />
                  <View className="flex-1">
                    <Text
                      className={`${isDark ? "text-dark-buttonText" : "text-white"} font-bold text-lg`}
                    >
                      {offer.name} • {offer.points} pts
                    </Text>
                    <Text
                      className={`${isDark ? "text-dark-buttonText" : "text-white"} text-base`}
                    >
                      {offer.items
                        .map((i) => `${i.name} x${i.quantity}`)
                        .join(", ")}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeOffer(offer.id)}>
                    <Ionicons
                      name="close-circle"
                      size={22}
                      color={isDark ? "#320120" : "#FFFFFF"}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Cart Items */}
          <View className="mb-6">
            {cartItems.map((item) => (
              <View
                key={
                  item.fromOfferId ? `${item.id}-${item.fromOfferId}` : item.id
                }
                className="p-2"
              >
                <View className="flex-row items-center">
                  {/* Secondary color line indicator */}
                  <View
                    className={`${isDark ? "bg-dark-secondary" : "bg-light-secondary"} w-1 h-8 mr-3`}
                  />

                  {/* Product Info */}
                  <View className="flex-1">
                    <Text
                      className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-lg font-semibold`}
                    >
                      {item.name}
                      {item.quantity > 1 ? ` x${item.quantity}` : ""}
                    </Text>
                  </View>

                  {/* Price/Offer and Remove */}
                  <View className="flex-row items-center">
                    {item.fromOfferId ? (
                      <Text
                        className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-lg font-semibold mr-3`}
                      >
                        Offert
                      </Text>
                    ) : (
                      <Text
                        className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-lg font-semibold mr-3`}
                      >
                        {item.price * item.quantity === 0
                          ? "0€"
                          : `${(item.price * item.quantity).toFixed(2)}€`}
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={() =>
                        !item.fromOfferId && removeFromCart(item.id)
                      }
                      disabled={!!item.fromOfferId}
                      className="p-2"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={
                          item.fromOfferId
                            ? isDark
                              ? "#6A5553"
                              : "#CBD5C1"
                            : isDark
                              ? "#FD9BD9"
                              : "#5B715F"
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Modal d'erreur */}
        <Modal transparent animationType="fade" visible={errorModal.visible} onRequestClose={() => setErrorModal({ visible: false, title: '', message: '' })}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className={`${isDark ? 'bg-dark-background' : 'bg-white'} w-full rounded-2xl p-5`}>
              <Text className={`${isDark ? 'text-dark-text' : 'text-gray-900'} text-lg font-semibold mb-2`}>{errorModal.title || 'Erreur'}</Text>
              <Text className={`${isDark ? 'text-dark-textSecondary' : 'text-gray-700'} mb-4`}>{errorModal.message}</Text>
              <View className="flex-row justify-end">
                <TouchableOpacity onPress={() => setErrorModal({ visible: false, title: '', message: '' })} className={`${isDark ? 'bg-dark-secondary' : 'bg-light-secondary'} px-4 py-2 rounded-lg`}>
                  <Text className={`${isDark ? 'text-dark-buttonText' : 'text-white'} font-semibold`}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Footer */}
        <View
          className={`${isDark ? "bg-dark-surface" : "bg-light-surface"} p-4 pb-8 border-t border-gray-300`}
        >
          {/* Subtotal */}
          <View className="flex-row justify-between items-center mb-4">
            <Text
              className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-lg font-semibold`}
            >
              Sous-Total
            </Text>
            <Text
              className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-lg font-bold`}
            >
              {getTotalPrice() === 0 ? "0€" : `${getTotalPrice().toFixed(2)}€`}
            </Text>
          </View>

          {/* Gift Option */}
          <TouchableOpacity
            className={`${isDark ? "bg-dark-textSecondary" : "bg-light-background"} p-4 rounded-lg border border-gray-300 mb-4`}
            onPress={() => setIsGiftChecked(!isGiftChecked)}
          >
            <View className="flex-row items-center">
              <View
                className={`w-5 h-5 border-2 ${isDark ? "border-gray-600" : "border-gray-400"} rounded mr-3 items-center justify-center`}
              >
                {isGiftChecked && (
                  <Ionicons
                    name="checkmark"
                    size={12}
                    color={isDark ? "#2C2221" : "#3A2E2C"}
                  />
                )}
              </View>
              <Text
                className={`${isDark ? "text-dark-background" : "text-light-text"} text-base`}
              >
                Offrir à un ami
              </Text>
            </View>
          </TouchableOpacity>

          {/* Pay / Free order Button */}
          {(() => {
            const total = getTotalPrice();
            const hasItems = cartItems.length > 0;
            const isFree = total === 0 && hasItems;
            const disabled = !hasItems;
            const btnClasses = `${isDark ? "bg-dark-secondary" : "bg-light-secondary"} p-4 rounded-lg ${disabled ? "opacity-60" : "opacity-100"}`;
            const labelClasses = `${isDark ? "text-dark-buttonText" : "text-white"} text-lg font-bold text-center`;

            const handlePress = async () => {
              if (disabled) return;
              if (isFree) {
                // Nouveau flux: création de commande après paiement (même pour gratuit)
                if (!user || !token) {
                  setErrorModal({
                    visible: true,
                    title: 'Connexion requise',
                    message: 'Veuillez vous connecter pour commander gratuitement.',
                  });
                  return;
                }
                const MACHINE_ID = selectedMachineId || '';
                if (!MACHINE_ID) {
                  setErrorModal({
                    visible: true,
                    title: 'Erreur',
                    message: 'Aucune machine sélectionnée. Veuillez en sélectionner une.',
                  });
                  return;
                }
                // Pré-validation du stock côté serveur (gratuit)
                const checkFree = await validateStockBeforeCheckout(MACHINE_ID);
                if (!checkFree.ok) {
                  setErrorModal({ visible: true, title: 'Stock insuffisant', message: checkFree.message });
                  return;
                }
                router.push({
                  pathname: '/payment-success',
                  params: {
                    paymentIntentId: 'free',
                    amount: '0',
                    currency: 'eur',
                    userId: user.id,
                    machineId: MACHINE_ID,
                  },
                });
                return;
              }
              // Paiement d'abord, commande après succès
              if (!user || !token) {
                setErrorModal({
                  visible: true,
                  title: 'Connexion requise',
                  message: 'Veuillez vous connecter pour effectuer le paiement.',
                });
                return;
              }
                const MACHINE_ID = selectedMachineId || '';
                if (!MACHINE_ID) {
                  setErrorModal({
                    visible: true,
                    title: 'Erreur',
                    message: 'Aucune machine sélectionnée. Veuillez en sélectionner une.',
                  });
                  return;
                }
              // Pré-validation du stock côté serveur (payant)
              const checkPaid = await validateStockBeforeCheckout(MACHINE_ID);
              if (!checkPaid.ok) {
                setErrorModal({ visible: true, title: 'Stock insuffisant', message: checkPaid.message });
                return;
              }
              router.push({
                pathname: '/checkout',
                params: {
                  amount: Math.round(total * 100).toString(),
                  currency: 'eur',
                  userId: user.id,
                  machineId: MACHINE_ID,
                },
              });
            };

            return (
              <TouchableOpacity className={btnClasses} onPress={handlePress} disabled={disabled}>
                <Text className={labelClasses}>
                  {disabled ? "Panier vide" : isFree ? "Commander gratuitement" : "Payer maintenant"}
                </Text>
              </TouchableOpacity>
            );
          })()}
        </View>
      </View>
    </>
  );
}
