import React from 'react';
import { View, Text } from 'react-native';
import { useTailwindTheme } from '../../hooks/useTailwindTheme';

interface UserInfoProps {
  name: string;
  email: string;
  showDivider?: boolean;
}

export default function UserInfo({ name, email, showDivider = true }: UserInfoProps) {
  const { isDark } = useTailwindTheme();

  return (
    <View className="items-start w-full">
      <Text
        className={`${isDark ? 'text-dark-text' : 'text-light-text'} text-3xl  mb-1`}
      >
        {name}
      </Text>
      <Text
        className={`${isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'} text-base opacity-80`}
      >
        {email}
      </Text>
      {showDivider && (
        <View className={`w-16 h-0.5 ${isDark ? 'bg-secondary' : 'bg-secondary'} rounded-full mt-4 opacity-60`} />
      )}
    </View>
  );
}
