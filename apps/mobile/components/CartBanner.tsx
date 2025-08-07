import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useTailwindTheme } from '../hooks/useTailwindTheme';
import { TabBarSpacer } from './ui';

interface CartBannerProps {
  itemCount: number;
  totalPrice: number;
  onPress: () => void;
}

export default function CartBanner({ itemCount, totalPrice, onPress }: CartBannerProps) {
  const { isDark } = useTailwindTheme();

  if (itemCount === 0) return null;

  return (
    <TabBarSpacer>
      <TouchableOpacity
        onPress={onPress}
        className={`${isDark ? 'bg-dark-secondary' : 'bg-light-secondary'} p-4`}
      >
              <View className="flex-row items-center justify-between">
          <View className="relative">
            <Image
              source={require('../assets/images/panier.png')}
              className="w-10 h-10"
              resizeMode="contain"
            />
            {itemCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">{itemCount}</Text>
              </View>
            )}
          </View>
          <Text className={`${isDark ? 'text-dark-buttonText' : 'text-white'} text-lg font-semibold flex-1 text-center`}>
            Afficher le panier
          </Text>
          <Text className={`${isDark ? 'text-dark-buttonText' : 'text-white'} text-lg font-bold`}>
            {totalPrice}€
          </Text>
        </View>
    </TouchableOpacity>
    </TabBarSpacer>
  );
}
