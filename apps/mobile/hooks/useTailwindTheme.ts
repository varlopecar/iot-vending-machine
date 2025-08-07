import { useColorScheme } from 'react-native';

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  buttonText?: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export const lightTheme: ThemeColors = {
  primary: '#F9F4EC', // PrimaryLight
  secondary: '#5B715F', // SecondaryLight
  tertiary: '#E3E8E4', // TertiaryLight
  background: '#F9F4EC', // PrimaryLight
  surface: '#E3E8E4', // TertiaryLight
  text: '#3A2E2C', // TextLight
  textSecondary: '#3A2E2C', // TextLight
  border: '#F3E9D8', // LineLight
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

export const darkTheme: ThemeColors = {
  primary: '#2C2221', // PrimaryDark
  secondary: '#FD9BD9', // SecondaryDark
  tertiary: '#FECDEC', // TertiaryDark
  background: '#2C2221', // PrimaryDark
  surface: '#493837', // LineDark
  text: '#FAE4D1', // TextDark
  textSecondary: '#FEFCFA', // SecondaryTextDark
  border: '#493837', // LineDark
  buttonText: '#320120', // ButtonTextDark
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
  buttonText: 'text-light-text dark:text-dark-buttonText',
  
  // Status colors
  success: 'text-light-success dark:text-dark-success',
  warning: 'text-light-warning dark:text-dark-warning',
  error: 'text-light-error dark:text-dark-error',
  info: 'text-light-info dark:text-dark-info',
} as const; 