/**
 * Service d'authentification sécurisé pour le back-office
 * Implémente les bonnes pratiques OWASP pour l'authentification web
 */

export interface AdminUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR';
  full_name: string;
}

export interface AuthTokens {
  accessToken: string;
  expiresAt: number;
}

class SecureAuthService {
  private static readonly ACCESS_TOKEN_KEY = 'admin_access_token';
  private static readonly USER_KEY = 'admin_user_data';
  private static readonly TOKEN_EXPIRY_KEY = 'admin_token_expiry';

  /**
   * Stocke les données d'authentification de manière sécurisée
   * Utilise sessionStorage au lieu de localStorage pour plus de sécurité
   */
  setAuthData(token: string, user: AdminUser): void {
    try {
      // Vérifier si on est côté client (pas SSR)
      if (typeof window === 'undefined') {
        console.warn('setAuthData appelé côté serveur, ignoré');
        return;
      }

      // Calculer l'expiration (30 minutes comme configuré dans le backend)
      const expiresAt = Date.now() + (30 * 60 * 1000);

      // Utiliser sessionStorage pour limiter la persistance
      sessionStorage.setItem(SecureAuthService.ACCESS_TOKEN_KEY, token);
      sessionStorage.setItem(SecureAuthService.USER_KEY, JSON.stringify(user));
      sessionStorage.setItem(SecureAuthService.TOKEN_EXPIRY_KEY, expiresAt.toString());

      // Programmer la déconnexion automatique
      this.scheduleAutoLogout(expiresAt);
    } catch (error) {
      console.error('Erreur lors du stockage des données d\'authentification:', error);
      throw new Error('Impossible de stocker les données d\'authentification');
    }
  }

  /**
   * Récupère le token d'authentification s'il est valide
   */
  getValidToken(): string | null {
    try {
      // Vérifier si on est côté client (pas SSR)
      if (typeof window === 'undefined') {
        return null;
      }

      const token = sessionStorage.getItem(SecureAuthService.ACCESS_TOKEN_KEY);
      const expiryStr = sessionStorage.getItem(SecureAuthService.TOKEN_EXPIRY_KEY);

      if (!token || !expiryStr) {
        return null;
      }

      const expiresAt = parseInt(expiryStr, 10);
      const now = Date.now();

      // Vérifier l'expiration côté client
      if (now >= expiresAt) {
        console.warn('Token expiré côté client');
        this.clearAuthData();
        return null;
      }

      // Vérifier qu'il reste au moins 5 minutes
      const fiveMinutes = 5 * 60 * 1000;
      if (now >= (expiresAt - fiveMinutes)) {
        console.warn('Token expire bientôt, recommandation de renouvellement');
      }

      return token;
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Récupère les données utilisateur si le token est valide
   */
  getValidUser(): AdminUser | null {
    try {
      // Vérifier si on est côté client (pas SSR)
      if (typeof window === 'undefined') {
        return null;
      }

      const token = this.getValidToken();
      if (!token) {
        return null;
      }

      const userStr = sessionStorage.getItem(SecureAuthService.USER_KEY);
      if (!userStr) {
        return null;
      }

      const user = JSON.parse(userStr) as AdminUser;

      // Validation basique des données utilisateur
      if (!user.id || !user.email || !user.role || !['ADMIN', 'OPERATOR'].includes(user.role)) {
        console.error('Données utilisateur invalides');
        this.clearAuthData();
        return null;
      }

      return user;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Vérifie si l'utilisateur a le rôle requis
   */
  hasRole(requiredRoles: Array<'ADMIN' | 'OPERATOR'>): boolean {
    const user = this.getValidUser();
    if (!user) {
      return false;
    }

    return requiredRoles.includes(user.role);
  }

  /**
   * Vérifie si l'utilisateur est authentifié et autorisé
   */
  isAuthenticated(): boolean {
    const token = this.getValidToken();
    const user = this.getValidUser();
    return !!(token && user);
  }

  /**
   * Supprime toutes les données d'authentification
   */
  clearAuthData(): void {
    try {
      // Vérifier si on est côté client (pas SSR)
      if (typeof window === 'undefined') {
        return;
      }

      sessionStorage.removeItem(SecureAuthService.ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(SecureAuthService.USER_KEY);
      sessionStorage.removeItem(SecureAuthService.TOKEN_EXPIRY_KEY);

      // Nettoyer les timers
      if (this.logoutTimer) {
        clearTimeout(this.logoutTimer);
        this.logoutTimer = null;
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des données d\'authentification:', error);
    }
  }

  private logoutTimer: NodeJS.Timeout | null = null;

  /**
   * Programme la déconnexion automatique à l'expiration du token
   */
  private scheduleAutoLogout(expiresAt: number): void {
    // Vérifier si on est côté client (pas SSR)
    if (typeof window === 'undefined') {
      return;
    }

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

    if (timeUntilExpiry > 0) {
      this.logoutTimer = setTimeout(() => {
        console.warn('Token expiré - déconnexion automatique');
        this.clearAuthData();
        // Déclencher un événement personnalisé pour notifier les composants
        window.dispatchEvent(new CustomEvent('auth:tokenExpired'));
      }, timeUntilExpiry);
    }
  }

  /**
   * Initialise le service (à appeler au démarrage de l'app)
   */
  initialize(): void {
    // Vérifier si on est côté client (pas SSR)
    if (typeof window === 'undefined') {
      return;
    }

    // Vérifier si il y a un token existant et programmer l'expiration
    const expiryStr = sessionStorage.getItem(SecureAuthService.TOKEN_EXPIRY_KEY);
    if (expiryStr) {
      const expiresAt = parseInt(expiryStr, 10);
      if (expiresAt > Date.now()) {
        this.scheduleAutoLogout(expiresAt);
      } else {
        this.clearAuthData();
      }
    }
  }
}

// Instance singleton
export const secureAuth = new SecureAuthService();
