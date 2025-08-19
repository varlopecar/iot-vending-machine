"use client";

import { useAuth } from "@/contexts/auth-context";
import { ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Array<'ADMIN' | 'OPERATOR'>;
  fallback?: ReactNode;
}

/**
 * Composant de protection basé sur les rôles
 * Affiche le contenu seulement si l'utilisateur a l'un des rôles autorisés
 */
export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { hasRole, isAuthenticated, isLoading } = useAuth();

  // Afficher le loading pendant la vérification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Rediriger si non authentifié (géré par AuthGuard)
  if (!isAuthenticated) {
    return null;
  }

  // Vérifier les rôles
  if (!hasRole(allowedRoles)) {
    return fallback || (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4">
          <svg
            className="w-16 h-16 text-red-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Accès non autorisé
        </h3>
        <p className="text-gray-600 mb-4">
          Vous n'avez pas les permissions nécessaires pour accéder à cette section.
        </p>
        <p className="text-sm text-gray-500">
          Rôles requis : {allowedRoles.join(' ou ')}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
