import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTailwindTheme } from '../../hooks/useTailwindTheme';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
}

export default function Header({
  title,
  onBack,
  showBackButton = true,
  rightComponent
}: HeaderProps) {
  const { isDark } = useTailwindTheme();

  return (
    <View className={`flex-row items-center justify-between px-4 py-3 border-b ${isDark ? 'bg-dark-background border-dark-border' : 'bg-light-background border-light-border'}`}>
      <View className="flex-row items-center flex-1">
        {showBackButton && onBack && (
          <TouchableOpacity
            onPress={onBack}
            className="mr-4"
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? '#FAE4D1' : '#3A2E2C'}
            />
          </TouchableOpacity>
        )}
        
        <Text
          className={`${isDark ? 'text-dark-text' : 'text-light-text'} text-xl font-bold flex-1`}
        >
          {title}
        </Text>
      </View>
      
      {rightComponent && (
        <View className="ml-4">
          {rightComponent}
        </View>
      )}
    </View>
  );
}
