import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useTailwindTheme } from '../hooks/useTailwindTheme';
import { useCart } from '../contexts/CartContext';

export default function CartScreen() {
  const router = useRouter();
  const { isDark } = useTailwindTheme();
  const [isGiftChecked, setIsGiftChecked] = useState(false);
  const { 
    cartItems, 
    appliedOffer, 
    removeFromCart, 
    updateQuantity, 
    getTotalPrice 
  } = useCart();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Panier',
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
          {/* Order Title */}
          <Text className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-2xl font-bold mb-8`}>
            Votre commande
          </Text>

          {/* Applied Offer */}
          {appliedOffer && (
            <View className={`${isDark ? 'bg-dark-secondary' : 'bg-light-secondary'} p-4 mb-8 mx-[-16px]`}>
              <View className="flex-row items-center">
                <Ionicons 
                  name="pricetag-outline" 
                  size={24} 
                  color={isDark ? '#320120' : '#FFFFFF'} 
                  style={{ marginRight: 12 }}
                />
                <View className="flex-1">
                  <Text className={`${isDark ? 'text-dark-buttonText' : 'text-white'} font-bold text-lg`}>
                    {appliedOffer.name}
                  </Text>
                  <Text className={`${isDark ? 'text-dark-buttonText' : 'text-white'} text-base`}>
                    {appliedOffer.itemName}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Cart Items */}
          <View className="mb-6">
            {cartItems.map((item) => (
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
                  
                  {/* Quantity and Remove */}
                  <View className="flex-row items-center">
                    <Text className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-lg font-semibold mr-3`}>
                      x{item.quantity}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeFromCart(item.id)}
                      className="p-2"
                    >
                      <Ionicons 
                        name="trash-outline" 
                        size={20} 
                        color={isDark ? '#FD9BD9' : '#5B715F'} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Footer */}
        <View className={`${isDark ? 'bg-dark-surface' : 'bg-light-surface'} p-4 pb-8 border-t border-gray-300`}>
          {/* Subtotal */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-lg font-semibold`}>
              Sous-Total
            </Text>
            <Text className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-lg font-bold`}>
              {getTotalPrice()}€
            </Text>
          </View>

          {/* Gift Option */}
          <TouchableOpacity
            className={`${isDark ? 'bg-dark-textSecondary' : 'bg-light-background'} p-4 rounded-lg border border-gray-300 mb-4`}
            onPress={() => setIsGiftChecked(!isGiftChecked)}
          >
            <View className="flex-row items-center">
              <View className={`w-5 h-5 border-2 ${isDark ? 'border-gray-600' : 'border-gray-400'} rounded mr-3 items-center justify-center`}>
                {isGiftChecked && (
                  <Ionicons 
                    name="checkmark" 
                    size={12} 
                    color={isDark ? '#2C2221' : '#3A2E2C'} 
                  />
                )}
              </View>
              <Text className={`${isDark ? 'text-dark-background' : 'text-light-text'} text-base`}>
                Offrir à un ami
              </Text>
            </View>
          </TouchableOpacity>

          {/* Validate Button */}
          <TouchableOpacity
            className={`${isDark ? 'bg-dark-secondary' : 'bg-light-secondary'} p-4 rounded-lg`}
            onPress={() => {
              // Navigation vers la page de validation
              console.log('Valider le panier');
            }}
          >
            <Text className={`${isDark ? 'text-dark-buttonText' : 'text-white'} text-lg font-bold text-center`}>
              Valider mon panier
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
