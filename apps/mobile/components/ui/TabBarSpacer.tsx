import React from 'react';
import { View } from 'react-native';
import { useTabBarHeight } from '../../hooks/useTabBarHeight';

interface TabBarSpacerProps {
  children?: React.ReactNode;
  className?: string;
}

export default function TabBarSpacer({ children, className = '' }: TabBarSpacerProps) {
  const tabBarHeight = useTabBarHeight();

  if (children) {
    return (
      <View style={{ marginBottom: tabBarHeight }} className={className}>
        {children}
      </View>
    );
  }

  return <View style={{ height: tabBarHeight }} />;
}
