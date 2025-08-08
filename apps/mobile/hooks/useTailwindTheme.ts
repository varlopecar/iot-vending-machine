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
  buttonText: '#FFFFFF',
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
  text: '#FEFCFA',
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
      } else {
        // Si aucun thème n'est sauvegardé, utiliser le thème système par défaut
        globalTheme = 'system';
        globalIsDark = systemColorScheme === 'dark';
        setCurrentTheme('system');
        setIsDark(systemColorScheme === 'dark');
      }
    } catch (error) {
      // En cas d'erreur, utiliser le thème système
      globalTheme = 'system';
      globalIsDark = systemColorScheme === 'dark';
      setCurrentTheme('system');
      setIsDark(systemColorScheme === 'dark');
    }
  };

  const setTheme = async (theme: Theme) => {
    try {
      await AsyncStorage.setItem('userTheme', theme);
      globalTheme = theme;
      globalIsDark = theme === 'light' ? false : theme === 'dark' ? true : systemColorScheme === 'dark';
      setCurrentTheme(theme);
      setIsDark(globalIsDark);
      themeEmitter.emit(THEME_CHANGE_EVENT, theme);
    } catch (error) {
      // Gestion silencieuse de l'erreur
    }
  };

  return {
    isDark,
    currentTheme,
    setTheme,
  };
}

export const themeClasses = {
  background: 'bg-light-background dark:bg-dark-background',
  surface: 'bg-light-surface dark:bg-dark-surface',
  text: 'text-light-text dark:text-dark-text',
  textSecondary: 'text-light-textSecondary dark:text-dark-textSecondary',
  textPrimary: 'text-light-primary dark:text-dark-primary',
  border: 'border-light-border dark:border-dark-border',
  button: 'bg-light-primary dark:bg-dark-primary',
  buttonText: 'text-light-buttonText dark:text-dark-buttonText',
  success: 'text-light-success dark:text-dark-success',
  warning: 'text-light-warning dark:text-dark-warning',
  error: 'text-light-error dark:text-dark-error',
  info: 'text-light-info dark:text-dark-info',
} as const;
