import React from 'react';
import { Text, TextProps } from 'react-native';

interface TailwindTextProps extends TextProps {
  className?: string;
  children?: React.ReactNode;
}

export function TailwindText({ className = '', children, ...props }: TailwindTextProps) {
  return (
    <Text className={className} {...props}>
      {children}
    </Text>
  );
} 