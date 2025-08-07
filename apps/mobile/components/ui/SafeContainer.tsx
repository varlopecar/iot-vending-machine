import React from 'react';
import { View, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTailwindTheme } from '../../hooks/useTailwindTheme';

interface SafeContainerProps extends ViewProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  className?: string;
}

export default function SafeContainer({ 
  children, 
  edges = ['top', 'bottom', 'left', 'right'],
  className = '',
  ...props 
}: SafeContainerProps) {
  const { isDark } = useTailwindTheme();
  
  const defaultClassName = `${isDark ? 'bg-dark-background' : 'bg-light-background'} flex-1`;
  const combinedClassName = className ? `${defaultClassName} ${className}` : defaultClassName;

  return (
    <SafeAreaView 
      className={combinedClassName}
      edges={edges}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
}
