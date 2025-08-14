import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpcMutation, LoginResponse, AuthUser } from '../lib/api';

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
          AsyncStorage.getItem('auth.token'),
          AsyncStorage.getItem('auth.user'),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
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
      await AsyncStorage.setItem('auth.token', data.token);
      await AsyncStorage.setItem('auth.user', JSON.stringify(data.user));
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
    await AsyncStorage.multiRemove(['auth.token', 'auth.user']);
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


