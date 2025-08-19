import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RequestContext } from './request-context.middleware';

export interface AuthenticatedUser {
  userId: string;
  role: 'CUSTOMER' | 'OPERATOR' | 'ADMIN';
}

@Injectable()
export class TrpcAuthMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Vérifie l'authentification et récupère l'utilisateur
   * @param authorization - Header Authorization (optionnel, utilise RequestContext si non fourni)
   * @returns Utilisateur authentifié avec rôle
   * @throws UnauthorizedException si le token est invalide
   */
  async authenticateUser(authorization?: string): Promise<AuthenticatedUser> {
    // Si pas d'authorization fourni, essayer de le récupérer depuis le contexte
    if (!authorization) {
      authorization = RequestContext.getAuthHeader();
    }
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token d\'authentification requis');
    }

    const token = authorization.slice(7); // Enlever 'Bearer '

    try {
      // Vérifier et décoder le JWT
      const payload = await this.jwtService.verifyAsync(token);
      
      if (!payload.sub) {
        throw new UnauthorizedException('Token invalide');
      }

      // Récupérer l'utilisateur complet avec le rôle
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, role: true }
      });

      if (!user) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      return {
        userId: user.id,
        role: user.role as 'CUSTOMER' | 'OPERATOR' | 'ADMIN'
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token invalide ou expiré');
    }
  }

  /**
   * Vérifie que l'utilisateur a l'un des rôles requis
   * @param user - Utilisateur authentifié
   * @param roles - Rôles autorisés
   * @throws UnauthorizedException si l'utilisateur n'a pas le bon rôle
   */
  requireRole(user: AuthenticatedUser, roles: Array<'CUSTOMER' | 'OPERATOR' | 'ADMIN'>): void {
    if (!roles.includes(user.role)) {
      throw new UnauthorizedException(`Accès refusé. Rôle requis: ${roles.join(' ou ')}`);
    }
  }

  /**
   * Vérifie que l'utilisateur peut accéder à cette ressource
   * (pour éviter les BOLA/BOPLA)
   * @param user - Utilisateur authentifié
   * @param resourceUserId - ID de l'utilisateur propriétaire de la ressource
   * @throws UnauthorizedException si l'accès n'est pas autorisé
   */
  requireOwnershipOrAdmin(user: AuthenticatedUser, resourceUserId: string): void {
    if (user.role === 'ADMIN' || user.role === 'OPERATOR') {
      // Les admins/opérateurs ont accès à toutes les ressources
      return;
    }

    if (user.userId !== resourceUserId) {
      throw new UnauthorizedException('Accès non autorisé à cette ressource');
    }
  }
}
