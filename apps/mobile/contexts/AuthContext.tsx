import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { trpcMutation, LoginResponse, AuthUser } from '../lib/api';
import { secureStorage } from '../lib/secure-storage';

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          secureStorage.getAuthToken(),
          secureStorage.getAuthUser(),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données d\'authentification:', error);
        // En cas d'erreur, on considère que l'utilisateur n'est pas connecté
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const data = await trpcMutation<{ email: string; password: string }, LoginResponse>(
        'auth.login',
        { email, password },
      );
      setUser(data.user);
      setToken(data.token);
      
      // Stockage sécurisé des données d'authentification
      await Promise.all([
        secureStorage.setAuthToken(data.token),
        secureStorage.setAuthUser(data.user),
      ]);
    } catch (e: any) {
      setError(e?.message || 'Identifiants invalides');
      throw e;
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    setError(null);
    try {
      await trpcMutation('auth.register', { full_name: fullName, email, password });
      // Enchaîner sur un login pour simplifier l’UX
      await login(email, password);
    } catch (e: any) {
      setError(e?.message || "Impossible de créer le compte");
      throw e;
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    
    // Suppression sécurisée des données d'authentification
    try {
      await secureStorage.clearAuthData();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // On continue même en cas d'erreur pour ne pas bloquer la déconnexion
    }
  };

  const clearError = () => setError(null);

  const value = useMemo<AuthState>(() => ({
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  }), [user, token, isLoading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


