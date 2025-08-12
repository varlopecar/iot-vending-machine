import {
  Controller,
  Post,
  Req,
  Res,
  HttpStatus,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { StripeWebhookService } from './stripe-webhook.service';
import { getStripeWebhookSecret } from '../stripe/stripeClient';
import { getStripeClient } from '../stripe/stripeClient';
import type Stripe from 'stripe';

@Controller('webhooks')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(private readonly stripeWebhookService: StripeWebhookService) {}

  /**
   * Endpoint webhook Stripe qui reçoit les événements de paiement
   * IMPORTANT: Doit recevoir le raw body pour la vérification de signature
   * 
   * @param req - Requête Express avec raw body
   * @param res - Réponse Express
   * @returns Réponse HTTP appropriée
   */
  @Post('stripe')
  async handleStripeWebhook(@Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      // Vérifier que le raw body est disponible
      if (!req.body || !Buffer.isBuffer(req.body)) {
        this.logger.error('Raw body non disponible pour la vérification de signature');
        res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Raw body requis pour la vérification de signature',
        });
        return;
      }

      // Récupérer la signature Stripe
      const signature = req.headers['stripe-signature'] as string;
      if (!signature) {
        this.logger.error('En-tête stripe-signature manquant');
        res.status(HttpStatus.BAD_REQUEST).json({
          error: 'En-tête stripe-signature requis',
        });
        return;
      }

      // Récupérer le secret webhook depuis l'environnement
      const webhookSecret = getStripeWebhookSecret();
      if (!webhookSecret) {
        this.logger.error('Secret webhook Stripe non configuré');
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'Configuration webhook manquante',
        });
        return;
      }

      let event: Stripe.Event;

      try {
        // Construire l'événement Stripe avec vérification de signature
        const stripe = getStripeClient();
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
      } catch (error) {
        this.logger.error('Échec de la vérification de signature webhook:', error);
        res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Signature webhook invalide',
        });
        return;
      }

      // Logger l'événement reçu (sans données sensibles)
      this.logger.log(
        `Webhook Stripe reçu: ${event.id} (${event.type}) pour la commande ${this.extractOrderIdFromEvent(event) || 'N/A'}`,
      );

      // Traiter l'événement via le service
      try {
        await this.stripeWebhookService.handleEvent(event);
        
        // Répondre avec succès
        res.status(HttpStatus.OK).json({
          received: true,
          eventId: event.id,
          eventType: event.type,
        });
        
        this.logger.log(`Événement ${event.id} traité avec succès`);
      } catch (error) {
        this.logger.error(`Erreur lors du traitement de l'événement ${event.id}:`, error);
        
        // Répondre avec une erreur 500 pour que Stripe retry
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'Erreur lors du traitement de l\'événement',
          eventId: event.id,
        });
      }
    } catch (error) {
      this.logger.error('Erreur inattendue dans le webhook Stripe:', error);
      
      // Répondre avec une erreur 500
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Erreur interne du serveur',
      });
    }
  }

  /**
   * Extrait l'ID de commande depuis un événement Stripe
   * @param event - Événement Stripe
   * @returns ID de commande ou null
   */
  private extractOrderIdFromEvent(event: Stripe.Event): string | null {
    try {
      if (event.data.object && 'metadata' in event.data.object) {
        const metadata = (event.data.object as any).metadata;
        return metadata?.orderId || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
