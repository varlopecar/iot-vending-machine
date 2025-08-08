import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTailwindTheme } from '../hooks/useTailwindTheme';

interface QRCodeDisplayProps {
  qrCodeImage: any;
  expiresAt: Date;
  onHelpPress?: () => void;
}

export default function QRCodeDisplay({ qrCodeImage, expiresAt, onHelpPress }: QRCodeDisplayProps) {
  const { isDark } = useTailwindTheme();

  const getTimeRemaining = () => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Expiré';
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h${minutes.toString().padStart(2, '0')}min`;
    } else {
      return `${minutes}min`;
    }
  };

  return (
    <View className="items-center mb-6">
      <Text
        className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-xl font-bold mb-4`}
      >
        Ton QR code
      </Text>
      
      {/* QR Code */}
      <View 
        className={`p-4 rounded-xl mb-4 ${
          isDark ? 'bg-white' : 'bg-white'
        }`}
        accessible={false}
        accessibilityLabel=""
        importantForAccessibility="no"
      >
        <Image
          source={qrCodeImage}
          className="w-64 h-64"
          resizeMode="contain"
          accessible={false}
          accessibilityLabel=""
          importantForAccessibility="no"
        />
      </View>
      
      {/* Temps d'expiration */}
      <Text
        className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-base mb-2`}
      >
        Expire dans : {getTimeRemaining()}
      </Text>
      
      {/* Lien d'aide */}
      {onHelpPress && (
        <TouchableOpacity onPress={onHelpPress} className="mt-2">
          <Text
            className={`${isDark ? 'text-dark-secondary' : 'text-light-secondary'} text-sm underline`}
          >
            Comment utiliser ce QR code ?
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
