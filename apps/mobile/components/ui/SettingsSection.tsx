import React from 'react';
import { View, Text } from 'react-native';
import { useTailwindTheme } from '../../hooks/useTailwindTheme';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  marginTop?: boolean;
}

export default function SettingsSection({
  title,
  children,
  marginTop = true
}: SettingsSectionProps) {
  const { isDark } = useTailwindTheme();

  return (
    <View className={`${marginTop ? 'mt-6' : ''}`}>
      <Text
        className={`${isDark ? 'text-dark-text' : 'text-light-text'} text-lg font-bold mb-3 ml-1`}
      >
        {title}
      </Text>
      <View className={`${isDark ? 'bg-surface' : 'bg-surface'} rounded-2xl p-4`}>
        {children}
      </View>
    </View>
  );
}
