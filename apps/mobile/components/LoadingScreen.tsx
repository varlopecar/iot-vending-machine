import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { useTailwindTheme } from '../hooks/useTailwindTheme';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Chargement..." }: LoadingScreenProps) {
  const { isDark } = useTailwindTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View 
      className={`flex-1 justify-center items-center ${
        isDark ? 'bg-dark-background' : 'bg-light-background'
      }`}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center"
      >
        {/* Indicateur de chargement animé */}
        <View className="mb-4">
          <View 
            className={`w-12 h-12 rounded-full border-4 ${
              isDark ? 'border-dark-surface' : 'border-light-surface'
            }`}
            style={{
              borderTopColor: isDark ? '#FDF8F0' : '#2A1810',
            }}
          />
        </View>
        
        {/* Message de chargement */}
        <Text 
          className={`text-lg font-medium ${
            isDark ? 'text-dark-text' : 'text-light-text'
          }`}
        >
          {message}
        </Text>
      </Animated.View>
    </View>
  );
}
