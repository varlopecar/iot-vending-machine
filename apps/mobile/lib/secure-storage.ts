import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Service de stockage sécurisé pour les données sensibles
 * Utilise SecureStore/Keychain sur mobile, localStorage sur web (dev uniquement)
 */
class SecureStorageService {
  private static readonly AUTH_TOKEN_KEY = 'auth.token';
  private static readonly AUTH_USER_KEY = 'auth.user';

  /**
   * Stocke un token d'authentification de manière sécurisée
   * @param token - Token JWT à stocker
   */
  async setAuthToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Fallback pour le développement web - NE PAS utiliser en production
        localStorage.setItem(SecureStorageService.AUTH_TOKEN_KEY, token);
        return;
      }

      await SecureStore.setItemAsync(SecureStorageService.AUTH_TOKEN_KEY, token, {
        requireAuthentication: false, // Changez en true si vous voulez demander l'authentification biométrique
        keychainService: 'VendingMachine',
      });
    } catch (error) {
      console.error('Erreur lors du stockage sécurisé du token:', error);
      throw new Error('Impossible de stocker le token de manière sécurisée');
    }
  }

  /**
   * Récupère le token d'authentification stocké
   * @returns Token JWT ou null si non trouvé
   */
  async getAuthToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Fallback pour le développement web
        return localStorage.getItem(SecureStorageService.AUTH_TOKEN_KEY);
      }

      return await SecureStore.getItemAsync(SecureStorageService.AUTH_TOKEN_KEY, {
        requireAuthentication: false,
        keychainService: 'VendingMachine',
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  }

  /**
   * Stocke les données utilisateur de manière sécurisée
   * @param user - Objet utilisateur à stocker
   */
  async setAuthUser(user: any): Promise<void> {
    try {
      const userData = JSON.stringify(user);
      
      if (Platform.OS === 'web') {
        localStorage.setItem(SecureStorageService.AUTH_USER_KEY, userData);
        return;
      }

      await SecureStore.setItemAsync(SecureStorageService.AUTH_USER_KEY, userData, {
        requireAuthentication: false,
        keychainService: 'VendingMachine',
      });
    } catch (error) {
      console.error('Erreur lors du stockage sécurisé des données utilisateur:', error);
      throw new Error('Impossible de stocker les données utilisateur de manière sécurisée');
    }
  }

  /**
   * Récupère les données utilisateur stockées
   * @returns Objet utilisateur ou null si non trouvé
   */
  async getAuthUser(): Promise<any | null> {
    try {
      let userData: string | null;
      
      if (Platform.OS === 'web') {
        userData = localStorage.getItem(SecureStorageService.AUTH_USER_KEY);
      } else {
        userData = await SecureStore.getItemAsync(SecureStorageService.AUTH_USER_KEY, {
          requireAuthentication: false,
          keychainService: 'VendingMachine',
        });
      }

      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  }

  /**
   * Supprime toutes les données d'authentification stockées
   */
  async clearAuthData(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(SecureStorageService.AUTH_TOKEN_KEY);
        localStorage.removeItem(SecureStorageService.AUTH_USER_KEY);
        return;
      }

      await Promise.all([
        SecureStore.deleteItemAsync(SecureStorageService.AUTH_TOKEN_KEY, {
          keychainService: 'VendingMachine',
        }),
        SecureStore.deleteItemAsync(SecureStorageService.AUTH_USER_KEY, {
          keychainService: 'VendingMachine',
        }),
      ]);
    } catch (error) {
      console.error('Erreur lors de la suppression des données d\'authentification:', error);
      // On continue même en cas d'erreur pour ne pas bloquer la déconnexion
    }
  }

  /**
   * Vérifie si des données d'authentification sont stockées
   * @returns true si des données sont présentes
   */
  async hasAuthData(): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      return !!token;
    } catch (error) {
      console.error('Erreur lors de la vérification des données d\'authentification:', error);
      return false;
    }
  }
}

// Instance singleton
export const secureStorage = new SecureStorageService();
