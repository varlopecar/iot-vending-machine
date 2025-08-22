"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { secureAuth, AdminUser } from "@/lib/secure-auth";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: "CUSTOMER" | "OPERATOR" | "ADMIN";
  points: number;
  barcode: string;
  created_at: string;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: Array<'ADMIN' | 'OPERATOR'>) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initialiser le service d'authentification sécurisé
    secureAuth.initialize();

    // Vérifier si l'utilisateur est déjà connecté avec un token valide
    const validToken = secureAuth.getValidToken();
    const validUser = secureAuth.getValidUser();

    if (validToken && validUser) {
      setToken(validToken);
      setUser(validUser);
    }

    // Écouter les événements d'expiration de token
    const handleTokenExpired = () => {
      setToken(null);
      setUser(null);
      router.push("/login");
    };

    window.addEventListener('auth:tokenExpired', handleTokenExpired);

    setIsLoading(false);

    // Cleanup
    return () => {
      window.removeEventListener('auth:tokenExpired', handleTokenExpired);
    };
  }, [router]);

  const login = (newToken: string, newUser: AdminUser) => {
    // Utiliser le service d'authentification sécurisé
    secureAuth.setAuthData(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    // Nettoyer les données sécurisées
    secureAuth.clearAuthData();
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const hasRole = (roles: Array<'ADMIN' | 'OPERATOR'>): boolean => {
    return secureAuth.hasRole(roles);
  };

  const value = {
    user,
    token,
    isLoading,
    login,
    logout,
    hasRole,
    isAuthenticated: secureAuth.isAuthenticated(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
