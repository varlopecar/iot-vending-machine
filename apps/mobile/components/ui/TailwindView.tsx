import React from 'react';
import { View, ViewProps } from 'react-native';

interface TailwindViewProps extends ViewProps {
  className?: string;
  children?: React.ReactNode;
}

export function TailwindView({ className = '', children, ...props }: TailwindViewProps) {
  return (
    <View className={className} {...props}>
      {children}
    </View>
  );
} 