import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useTailwindTheme } from '../hooks/useTailwindTheme';
import { QRCodeDisplay } from '../components';
import { useOrders } from '../contexts/OrdersContext';
import { getOrderById as getOrderByIdApi, cancelOrder } from '../lib/orders';
import { getAllProducts } from '../lib/products';
import { displayNameFromServerName } from '../lib/productMapping';
import QRCode from 'react-native-qrcode-svg';

export default function QRCodeScreen() {
  const { isDark } = useTailwindTheme();
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { getOrderById, setOrderStatus } = useOrders();
  const [order, setOrder] = useState<ReturnType<typeof getOrderById> | null>(() => getOrderById(orderId || "") || null);
  const [loading, setLoading] = useState(false);

  // Sync si ordre arrive plus tard
  React.useEffect(() => {
    if (!orderId) return;
    (async () => {
      setLoading(true);
      try {
        // 1) Tenter depuis le contexte local (si la liste est à jour)
        const local = getOrderById(orderId);
        if (local) {
          setOrder(local);
        }
        // 2) Récupérer la version serveur
        try {
          const server = await getOrderByIdApi(orderId);
          // Enrichir les items avec le nom FR à partir du catalogue serveur
          const products = await getAllProducts();
          const idToName = new Map<string, string>(
            products.map((p) => [p.id, displayNameFromServerName(p.name)])
          );
          const mapped = {
            id: server.id,
            date: new Date(server.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            items: server.items.map(it => ({
              id: it.product_id,
              name: idToName.get(it.product_id) || '',
              price: 0,
              image: null,
              quantity: it.quantity,
            })),
            totalPrice: (server.total_price ?? 0),
            qrCodeToken: server.qr_code_token,
            expiresAt: new Date(server.expires_at),
            status: (server.status as any) || 'active',
          } as const;
          setOrder(mapped);
        } catch (e) {
          console.error('[QR] Erreur fetch serveur:', e);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  const handleHelpPress = () => {
    Alert.alert(
      'Comment utiliser votre QR code',
      '1. Présentez votre QR code devant le scanner de la machine\n2. Attendez la validation\n3. Récupérez vos produits dans le bac de réception',
      [{ text: 'Compris !', style: 'default' }]
    );
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Annuler la commande',
      'Êtes-vous sûr de vouloir annuler cette commande ?',
      [
        { text: 'Non', style: 'cancel' },
        { 
          text: 'Oui', 
          style: 'destructive',
          onPress: () => {
            if (!order) return;
            (async () => {
              try {
                await cancelOrder(order.id);
                setOrderStatus(order.id, 'cancelled');
                setOrder({ ...order, status: 'cancelled' });
                Alert.alert('Commande annulée', 'Votre commande a été annulée avec succès.');
                router.back();
              } catch (e) {
                Alert.alert('Erreur', "Impossible d'annuler la commande");
              }
            })();
          }
        }
      ]
    );
  };

  if (!order) {
    return (
      <View className={`${isDark ? 'bg-dark-background' : 'bg-light-background'} flex-1 justify-center items-center`}>
        <Text
          className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-lg`}
        >
          Commande non trouvée
        </Text>
      </View>
    );
  }

  const isCancelable = order.status === 'active';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Informations sur la commande',
          headerBackTitle: '',
          headerStyle: {
            backgroundColor: isDark ? '#493837' : '#E3E8E4',
          },
          headerTintColor: isDark ? '#FEFCFA' : '#3A2E2C',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
        }}
      />
      <View className={`${isDark ? 'bg-dark-background' : 'bg-light-background'} flex-1`}>
        <ScrollView className="flex-1 p-4">
          {/* QR Code - image mock ou token dynamique */}
          {order.qrCodeToken ? (
            <View className="items-center mb-6">
              <Text
                className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-xl font-bold mb-4`}
              >
                Ton QR code
              </Text>
              <View className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-white' : 'bg-white'}`}>
                <QRCode value={order.qrCodeToken} size={256} color="black" backgroundColor="white" />
              </View>
            </View>
          ) : (
            <QRCodeDisplay
              qrCodeImage={order.qrCodeImage}
              expiresAt={order.expiresAt}
              onHelpPress={handleHelpPress}
            />
          )}

          {/* Détails de la commande */}
          <View className="mb-6">
            <Text
              className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-lg font-semibold mb-4`}
            >
              Contenu de la commande
            </Text>
            
            {order.items.map((item) => (
              <View
                key={item.id}
                className="p-2"
              >
                <View className="flex-row items-center">
                  {/* Secondary color line indicator */}
                  <View className={`${isDark ? 'bg-dark-secondary' : 'bg-light-secondary'} w-1 h-8 mr-3`} />
                  
                  {/* Product Info */}
                  <View className="flex-1">
                    <Text className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-lg font-semibold`}>
                      {item.name}
                    </Text>
                  </View>
                  
                  {/* Quantity */}
                  <View className="flex-row items-center">
                    <Text className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-lg font-semibold`}>
                      x{item.quantity}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Bouton d'annulation */}
        <View className="p-4 pb-8">
          <TouchableOpacity
            onPress={isCancelable ? handleCancelOrder : undefined}
            disabled={!isCancelable}
            className={`border-2 ${isCancelable ? 'border-red-500' : 'border-gray-400'} rounded-lg py-4 px-6 items-center`}
            activeOpacity={0.7}
          >
            <Text className={`${isCancelable ? 'text-red-500' : 'text-gray-400'} text-lg font-semibold`}>
              {isCancelable ? 'Annuler la commande' : 'Commande annulée'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
