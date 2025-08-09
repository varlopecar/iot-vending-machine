import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTailwindTheme } from '../hooks/useTailwindTheme';

interface SuccessBannerProps {
  visible: boolean;
  message: string;
  onClose?: () => void;
  autoHide?: boolean;
  duration?: number;
}

export default function SuccessBanner({ 
  visible, 
  message, 
  onClose, 
  autoHide = true, 
  duration = 3000 
}: SuccessBannerProps) {
  const { isDark, colors } = useTailwindTheme();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animation d'entrée
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide après la durée spécifiée
      if (autoHide) {
        const timer = setTimeout(() => {
          hideBanner();
        }, duration);

        return () => clearTimeout(timer);
      }
    } else {
      hideBanner();
    }
  }, [visible]);

  const hideBanner = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.();
    });
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none">
      <View style={{ flex: 1 }} pointerEvents="box-none">
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
            position: 'absolute',
            top: insets.top + 16,
            left: 16,
            right: 16,
            zIndex: 999,
            // Couleur de fond calée sur la couleur secondaire du thème
            backgroundColor: colors.secondary,
          }}
          className="rounded-lg shadow-lg"
        >
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center flex-1">
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
              >
                <Ionicons name="checkmark" size={16} color={colors.buttonText} />
              </View>
              <Text
                className="font-semibold text-base flex-1"
                style={{ color: colors.buttonText }}
              >
                {message}
              </Text>
            </View>

            {!autoHide && (
              <TouchableOpacity onPress={hideBanner} className="ml-2">
                <Ionicons name="close" size={20} color={colors.buttonText} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
