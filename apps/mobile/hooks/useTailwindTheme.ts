import { useColorScheme } from 'react-native';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export const lightTheme: ThemeColors = {
  primary: '#0a7ea4',
  secondary: '#687076',
  background: '#ffffff',
  surface: '#f8f9fa',
  text: '#11181C',
  textSecondary: '#687076',
  border: '#e1e5e9',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

export const darkTheme: ThemeColors = {
  primary: '#ffffff',
  secondary: '#9BA1A6',
  background: '#151718',
  surface: '#1a1b1e',
  text: '#ECEDEE',
  textSecondary: '#9BA1A6',
  border: '#2a2b2e',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

export function useTailwindTheme() {
  const colorScheme = useColorScheme();
  const theme: Theme = colorScheme === 'dark' ? 'dark' : 'light';
  
  const colors = theme === 'dark' ? darkTheme : lightTheme;
  
  return {
    theme,
    colors,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
}

// Utility function to get theme-aware class names
export function getThemeClasses(baseClasses: string, lightClasses?: string, darkClasses?: string): string {
  if (!lightClasses && !darkClasses) {
    return baseClasses;
  }
  
  const lightSuffix = lightClasses ? ` ${lightClasses}` : '';
  const darkSuffix = darkClasses ? ` ${darkClasses}` : '';
  
  return `${baseClasses}${lightSuffix} dark:${darkSuffix}`;
}

// Predefined theme-aware class combinations
export const themeClasses = {
  // Backgrounds
  background: 'bg-light-background dark:bg-dark-background',
  surface: 'bg-light-surface dark:bg-dark-surface',
  
  // Text
  text: 'text-light-text dark:text-dark-text',
  textSecondary: 'text-light-textSecondary dark:text-dark-textSecondary',
  textPrimary: 'text-light-primary dark:text-dark-primary',
  
  // Borders
  border: 'border-light-border dark:border-dark-border',
  
  // Interactive elements
  button: 'bg-light-primary dark:bg-dark-primary',
  buttonText: 'text-white dark:text-black',
  
  // Status colors
  success: 'text-light-success dark:text-dark-success',
  warning: 'text-light-warning dark:text-dark-warning',
  error: 'text-light-error dark:text-dark-error',
  info: 'text-light-info dark:text-dark-info',
} as const; 