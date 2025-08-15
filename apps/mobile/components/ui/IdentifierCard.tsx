import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTailwindTheme } from '../../hooks/useTailwindTheme';
import RealBarcode from './RealBarcode';

interface IdentifierCardProps {
  identifier: string;
  onCopy?: () => void;
  showCopyButton?: boolean;
}

export default function IdentifierCard({
  identifier,
  onCopy,
  showCopyButton = true
}: IdentifierCardProps) {
  const { isDark } = useTailwindTheme();

  const handleCopy = () => {
    if (onCopy) {
      onCopy();
    }
    // Ici on pourrait ajouter la logique pour copier dans le presse-papiers
    console.log('Copied identifier:', identifier);
  };

  return (
    <View className={`${isDark ? 'bg-white' : 'bg-white'} rounded-2xl p-4 shadow-sm`}>
      {/* Code-barres réel */}
      <View className="mb-3 items-center justify-center">
        <RealBarcode
          value={identifier}
          width={2}
          height={60}
          format="CODE128"
          displayValue={false}
          lineColor="#000000"
          background="#FFFFFF"
        />
      </View>
      
      {/* Identifiant numérique */}
      <View className="flex-row items-center justify-between">
        <Text className="text-black text-lg font-mono tracking-wider">
          {identifier}
        </Text>
        
        {showCopyButton && (
          <TouchableOpacity
            onPress={handleCopy}
            className="p-2 rounded-lg bg-gray-100"
            activeOpacity={0.7}
          >
            <Ionicons name="copy-outline" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
