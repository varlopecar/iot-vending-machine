import React from 'react';
import { View } from 'react-native';
import { useTailwindTheme } from '../hooks/useTailwindTheme';
import VendingDark from '../assets/images/vendingDark.svg';
import VendingLight from '../assets/images/vendingLight.svg';

interface VendingIllustrationProps {
  className?: string;
}

export function VendingIllustration({ className = '' }: VendingIllustrationProps) {
  const { isDark } = useTailwindTheme();
  
  const VendingSvg = isDark ? VendingDark : VendingLight;
  
  return (
    <View className={`items-center justify-center ${className}`}>
      <VendingSvg width={320} height={320} />
    </View>
  );
}
