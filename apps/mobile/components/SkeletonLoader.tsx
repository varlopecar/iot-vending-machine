import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useTailwindTheme } from '../hooks/useTailwindTheme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

// Composant de base pour un élément skeleton
function SkeletonElement({ width, height, borderRadius = 4, className = '' }: SkeletonLoaderProps) {
  const { isDark } = useTailwindTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, []);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={{
        width: typeof width === 'string' ? parseInt(width, 10) : width,
        height: typeof height === 'string' ? parseInt(height, 10) : height,
        borderRadius,
        opacity: shimmerOpacity,
        backgroundColor: isDark ? '#493837' : '#E5E5E5',
      }}
      className={className}
    />
  );
}

// Skeleton pour ProductCard
export function ProductCardSkeleton() {
  return (
    <View className="w-full mb-2">
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="flex-row items-center flex-1">
          {/* Image placeholder */}
          <SkeletonElement width={60} height={60} borderRadius={8} className="mr-4" />

          {/* Content */}
          <View className="flex-1">
            <SkeletonElement width="80%" height={20} className="mb-2" />
            <SkeletonElement width="60%" height={16} className="mb-2" />
            <SkeletonElement width="40%" height={16} />
          </View>
        </View>

        {/* Button placeholder */}
        <SkeletonElement width={80} height={36} borderRadius={18} />
      </View>

      {/* Bottom border */}
      <View className="w-full h-px bg-gray-200" />
    </View>
  );
}

// Skeleton pour OrderCard
export function OrderCardSkeleton() {
  return (
    <View className="w-full mb-3">
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="flex-1">
          <SkeletonElement width="70%" height={20} className="mb-2" />
          <SkeletonElement width="50%" height={16} className="mb-2" />
          <SkeletonElement width="40%" height={16} />
        </View>

        {/* Status indicator */}
        <SkeletonElement width={60} height={24} borderRadius={12} />
      </View>

      {/* Bottom border */}
      <View className="w-full h-px bg-gray-200" />
    </View>
  );
}

// Skeleton pour CartBanner
export function CartBannerSkeleton() {
  return (
    <View className="h-20 bg-gray-100 rounded-t-lg p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <SkeletonElement width={24} height={24} borderRadius={12} className="mr-3" />
          <SkeletonElement width={100} height={20} />
        </View>
        <SkeletonElement width={80} height={40} borderRadius={20} />
      </View>
    </View>
  );
}

// Skeleton pour le header
export function HeaderSkeleton() {
  return (
    <View className="p-4 mb-6">
      <SkeletonElement width="60%" height={40} className="mb-2" />
      <SkeletonElement width="80%" height={24} className="mt-6" />
    </View>
  );
}

// Skeleton pour la liste de produits
export function ProductListSkeleton() {
  return (
    <View className="mb-4">
      {[1, 2, 3, 4].map((index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </View>
  );
}

// Skeleton pour la liste de commandes
export function OrderListSkeleton() {
  return (
    <View className="px-4">
      {[1, 2, 3].map((index) => (
        <OrderCardSkeleton key={index} />
      ))}
    </View>
  );
}

// Skeleton pour la page complète
export function PageSkeleton() {
  return (
    <View className="flex-1">
      <HeaderSkeleton />
      <ProductListSkeleton />
    </View>
  );
}
