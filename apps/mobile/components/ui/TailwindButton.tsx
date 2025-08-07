import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, Text, TextProps } from 'react-native';

interface TailwindButtonProps extends TouchableOpacityProps {
  className?: string;
  textClassName?: string;
  children?: React.ReactNode;
  title?: string;
}

export function TailwindButton({ 
  className = '', 
  textClassName = '',
  children, 
  title,
  ...props 
}: TailwindButtonProps) {
  return (
    <TouchableOpacity 
      className={`bg-light-primary dark:bg-dark-primary px-4 py-3 rounded-lg ${className}`} 
      {...props}
    >
      {title && (
        <Text className={`text-white dark:text-black font-semibold text-center ${textClassName}`}>
          {title}
        </Text>
      )}
      {children}
    </TouchableOpacity>
  );
} 