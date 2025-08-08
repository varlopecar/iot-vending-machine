import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTailwindTheme } from '../../hooks/useTailwindTheme';

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
      {/* Code-barres simulé */}
      <View className="h-12 mb-3">
        <View className="flex-row h-full items-center justify-center">
          {identifier.split('').map((char, index) => (
            <View
              key={index}
              className={`h-full w-0.5 mx-0.5 ${
                char === ' ' ? 'bg-transparent' : 'bg-black'
              }`}
              style={{
                height: char === ' ' ? '50%' : '100%',
                opacity: char === ' ' ? 0 : 1
              }}
            />
          ))}
        </View>
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
