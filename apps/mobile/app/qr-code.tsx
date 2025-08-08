import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useTailwindTheme } from '../hooks/useTailwindTheme';
import { QRCodeDisplay } from '../components';
import { mockOrders } from '../data/mockProducts';

export default function QRCodeScreen() {
  const { isDark } = useTailwindTheme();
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  
  const [order, setOrder] = useState(() => {
    return mockOrders.find(o => o.id === orderId) || null;
  });

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
            // Ici on pourrait appeler une API pour annuler la commande
            Alert.alert('Commande annulée', 'Votre commande a été annulée avec succès.');
            router.back();
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

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Informations sur la commande',
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
          {/* QR Code */}
          <QRCodeDisplay
            qrCodeImage={order.qrCode}
            expiresAt={order.expiresAt}
            onHelpPress={handleHelpPress}
          />

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
            onPress={handleCancelOrder}
            className={`border-2 border-red-500 rounded-lg py-4 px-6 items-center`}
            activeOpacity={0.7}
          >
            <Text className="text-red-500 text-lg font-semibold">
              Annuler la commande
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
