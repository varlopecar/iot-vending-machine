import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTailwindTheme } from '../hooks/useTailwindTheme';

interface SuccessBannerProps {
  visible: boolean;
  message: string;
  onClose?: () => void;
  onPress?: () => void;
  autoHide?: boolean;
  duration?: number;
}

export default function SuccessBanner({ 
  visible, 
  message, 
  onClose, 
  onPress,
  autoHide = true, 
  duration = 3000 
}: SuccessBannerProps) {
  const { colors } = useTailwindTheme();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const isHidingRef = useRef(false);

  useEffect(() => {
    if (!visible) return;

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

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (autoHide) {
      timer = setTimeout(() => {
        hideBanner();
      }, duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [visible, autoHide, duration]);

  const hideBanner = () => {
    if (isHidingRef.current) return;
    isHidingRef.current = true;
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
      isHidingRef.current = false;
      onClose?.();
    });
  };

  const initialYRef = useRef<number | null>(null);
  const threshold = 25;

  const onStartShouldSetResponder = (_e: GestureResponderEvent) => {
    initialYRef.current = null;
    return false;
  };

  const onMoveShouldSetResponder = (e: GestureResponderEvent) => {
    const currentY = e.nativeEvent.pageY ?? 0;
    if (initialYRef.current === null) initialYRef.current = currentY;
    const dy = currentY - initialYRef.current;
    return Math.abs(dy) > 3;
  };

  const onMoveShouldSetResponderCapture = (e: GestureResponderEvent) => {
    const currentY = e.nativeEvent.pageY ?? 0;
    if (initialYRef.current === null) initialYRef.current = currentY;
    const dy = currentY - initialYRef.current;
    return Math.abs(dy) > 3;
  };

  const onResponderMove = (e: GestureResponderEvent) => {
    const currentY = e.nativeEvent.pageY ?? 0;
    if (initialYRef.current === null) initialYRef.current = currentY;
    const dy = currentY - initialYRef.current;
    if (dy < -threshold) hideBanner();
  };

  const onResponderRelease = () => {
    initialYRef.current = null;
  };

  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      pointerEvents="box-none"
    >
      <Animated.View
        style={
          {
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
            position: 'absolute',
            top: insets.top + 16,
            left: 16,
            right: 16,
            zIndex: 999,
            backgroundColor: colors.secondary,
            borderRadius: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 5,
          }
        }
        onStartShouldSetResponder={onStartShouldSetResponder}
        onMoveShouldSetResponderCapture={onMoveShouldSetResponderCapture}
        onMoveShouldSetResponder={onMoveShouldSetResponder}
        onResponderMove={onResponderMove}
        onResponderRelease={onResponderRelease}
        onResponderTerminationRequest={() => false}
      >
        <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  backgroundColor: 'rgba(0,0,0,0.15)'
                }}
              >
                <Ionicons name="checkmark" size={16} color={colors.buttonText} />
              </View>
              <Text style={{ color: colors.buttonText, fontWeight: '600', fontSize: 16, flex: 1 }}>
                {message}
              </Text>
            </View>

            {!autoHide && (
              <TouchableOpacity onPress={hideBanner} style={{ marginLeft: 8 }}>
                <Ionicons name="close" size={20} color={colors.buttonText} />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
