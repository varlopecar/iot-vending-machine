import { Input, Mutation, Query, Router } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import { CheckoutService } from './checkout.service';
import {
  createIntentSchema,
  createIntentResponseSchema,
  getStatusSchema,
  getStatusResponseSchema,
} from './checkout.schema';
import type { CreateIntentInput, GetStatusInput } from './checkout.schema';

@Router({ alias: 'checkout' })
export class CheckoutRouter {
  constructor(private readonly checkoutService: CheckoutService) {}

  /**
   * Crée une intention de paiement Stripe pour une commande
   *
   * @param input - ID de la commande à payer
   * @param ctx - Contexte tRPC avec l'utilisateur authentifié
   * @returns Informations de paiement pour le client mobile
   */
  @Mutation({
    input: createIntentSchema,
    output: createIntentResponseSchema,
  })
  async createIntent(@Input() input: CreateIntentInput, ctx: any) {
    try {
      // Vérifier l'authentification
      if (!ctx.user?.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Utilisateur non authentifié',
        });
      }

      return await this.checkoutService.createIntent(input, ctx.user.userId);
    } catch (error) {
      // Convertir les erreurs NestJS en erreurs tRPC
      if (error instanceof TRPCError) {
        throw error;
      }

      if (error instanceof Error) {
        // Erreurs métier
        if (error.message.includes('Commande introuvable')) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Commande introuvable',
          });
        }

        if (error.message.includes('Accès non autorisé')) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Accès non autorisé à cette commande',
          });
        }

        if (
          error.message.includes('ne permet pas le paiement') ||
          error.message.includes('a expiré') ||
          error.message.includes('doit être supérieur à 0')
        ) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }
      }

      // Erreur interne
      console.error('Erreur inattendue dans createIntent:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          "Erreur interne lors de la création de l'intention de paiement",
      });
    }
  }

  /**
   * Récupère le statut consolidé d'une commande
   *
   * @param input - ID de la commande
   * @param ctx - Contexte tRPC avec l'utilisateur authentifié
   * @returns Statut consolidé de la commande et du paiement
   */
  @Query({
    input: getStatusSchema,
    output: getStatusResponseSchema,
  })
  async getStatus(@Input() input: GetStatusInput, ctx: any) {
    try {
      // Vérifier l'authentification
      if (!ctx.user?.userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Utilisateur non authentifié',
        });
      }

      return await this.checkoutService.getStatus(input, ctx.user.userId);
    } catch (error) {
      // Convertir les erreurs NestJS en erreurs tRPC
      if (error instanceof TRPCError) {
        throw error;
      }

      if (error instanceof Error) {
        // Erreurs métier
        if (error.message.includes('Commande introuvable')) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Commande introuvable',
          });
        }

        if (error.message.includes('Accès non autorisé')) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Accès non autorisé à cette commande',
          });
        }
      }

      // Erreur interne
      console.error('Erreur inattendue dans getStatus:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Erreur interne lors de la récupération du statut',
      });
    }
  }

  /**
   * Finalise un paiement côté serveur en vérifiant l'état du PaymentIntent Stripe
   * Applique les mêmes effets que le webhook: PAID, stock, QR, points fidélité
   */
  // finalizePayment retiré selon la demande (retour à l'état initial)
}
