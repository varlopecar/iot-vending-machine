import { useColorScheme } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'events';

export type Theme = 'light' | 'dark' | 'system';

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
  primary: '#F9F4EC',
  secondary: '#5B715F',
  tertiary: '#E3E8E4',
  background: '#F9F4EC',
  surface: '#E3E8E4',
  text: '#3A2E2C',
  textSecondary: '#3A2E2C',
  border: '#F3E9D8',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

export const darkTheme: ThemeColors = {
  primary: '#2C2221',
  secondary: '#FD9BD9',
  tertiary: '#FECDEC',
  background: '#2C2221',
  surface: '#493837',
  text: '#FAE4D1',
  textSecondary: '#FEFCFA',
  border: '#493837',
  buttonText: '#320120',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

// Événement global pour synchroniser le thème
const themeEmitter = new EventEmitter();
themeEmitter.setMaxListeners(20); // Augmenter la limite de listeners
const THEME_CHANGE_EVENT = 'themeChange';

// État global du thème
let globalTheme: Theme = 'system';
let globalIsDark = false;

export function useTailwindTheme() {
  const systemColorScheme = useColorScheme();
  const [currentTheme, setCurrentTheme] = useState<Theme>(globalTheme);
  const [isDark, setIsDark] = useState(globalIsDark);
  const listenerRef = useRef<((theme: Theme) => void) | null>(null);

  useEffect(() => {
    // Charger le thème initial
    loadTheme();
    
    // Créer le handler une seule fois
    if (!listenerRef.current) {
      listenerRef.current = (theme: Theme) => {
        setCurrentTheme(theme);
        if (theme === 'light') setIsDark(false);
        else if (theme === 'dark') setIsDark(true);
        else setIsDark(systemColorScheme === 'dark');
      };
    }

    // Écouter les changements de thème
    themeEmitter.on(THEME_CHANGE_EVENT, listenerRef.current);
    
    return () => {
      if (listenerRef.current) {
        themeEmitter.off(THEME_CHANGE_EVENT, listenerRef.current);
      }
    };
  }, []); // Supprimer systemColorScheme de la dépendance

  // Effet séparé pour gérer les changements de systemColorScheme
  useEffect(() => {
    if (currentTheme === 'system') {
      setIsDark(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, currentTheme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('userTheme');
      if (savedTheme) {
        const theme = savedTheme as Theme;
        globalTheme = theme;
        globalIsDark = theme === 'light' ? false : theme === 'dark' ? true : systemColorScheme === 'dark';
        setCurrentTheme(theme);
        setIsDark(globalIsDark);
      }
    } catch (error) {
      console.log('Erreur lors du chargement du thème:', error);
    }
  };

  return {
    isDark,
  };
}


