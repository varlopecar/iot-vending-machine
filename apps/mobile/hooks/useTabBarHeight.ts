import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useTabBarHeight() {
  const insets = useSafeAreaInsets();
  
  // Hauteur approximative de la barre de navigation + marge de sécurité
  const tabBarHeight = 55; // Hauteur de base de la tab bar
  
  return tabBarHeight; // +20 pour une marge de sécurité
}
