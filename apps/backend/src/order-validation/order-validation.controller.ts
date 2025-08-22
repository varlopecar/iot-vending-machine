import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { OrdersService } from '../orders/orders.service';
import { z } from 'zod';
import {
  QRCodeDataDto,
  QRTokenDto,
  OrderValidationResponseDto,
  OrderStatusResponseDto,
} from '../dto/order-validation.dto';

// Schema pour la validation des données QR code
const qrCodeDataSchema = z.object({
  orderID: z.string().min(1),
  // Autres champs possibles dans le QR code
  machineID: z.string().optional(),
  userID: z.string().optional(),
  timestamp: z.string().optional(),
  signature: z.string().optional(), // Pour la sécurité du QR code
});

// Schema pour la validation par token QR
const qrTokenSchema = z.object({
  qr_code_token: z.string().min(1),
});

type QRCodeData = z.infer<typeof qrCodeDataSchema>;
type QRTokenData = z.infer<typeof qrTokenSchema>;

@ApiTags('order-validation')
@Controller('api/order-validation')
export class OrderValidationController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('validate-qr')
  @ApiOperation({
    summary: 'Validate QR code',
    description: 'Validate a QR code for order pickup',
  })
  @ApiBody({ type: QRCodeDataDto })
  @ApiResponse({
    status: 200,
    description: 'QR code validation result',
    type: OrderValidationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid QR code data' })
  async validateQRCode(@Body() body: QRCodeData) {
    try {
      // Validation des données d'entrée
      const validatedData = qrCodeDataSchema.parse(body);

      // Récupérer la commande par ID
      const order = await this.ordersService.getOrderById(
        validatedData.orderID,
      );

      if (!order) {
        return {
          status: 'INVALID_ORDER',
          message: 'Commande introuvable',
          order_id: validatedData.orderID,
        };
      }

      // Vérifier le statut de la commande
      if (order.status !== 'active') {
        return {
          status: 'INVALID_ORDER',
          message: `Commande dans un état invalide: ${order.status}`,
          order_id: validatedData.orderID,
          current_status: order.status,
        };
      }

      // Vérifier si la commande n'a pas expiré
      const now = new Date();
      const expiresAt = new Date(order.expires_at);

      if (expiresAt < now) {
        // Marquer la commande comme expirée
        await this.ordersService.updateOrder(order.id, { status: 'expired' });

        return {
          status: 'INVALID_ORDER',
          message: 'Commande expirée',
          order_id: validatedData.orderID,
          expired_at: order.expires_at,
        };
      }

      // Vérifications additionnelles si des données sont fournies
      if (
        validatedData.machineID &&
        validatedData.machineID !== order.machine_id
      ) {
        return {
          status: 'INVALID_ORDER',
          message: 'Machine incorrecte pour cette commande',
          order_id: validatedData.orderID,
          expected_machine: order.machine_id,
          provided_machine: validatedData.machineID,
        };
      }

      if (validatedData.userID && validatedData.userID !== order.user_id) {
        return {
          status: 'INVALID_ORDER',
          message: 'Utilisateur incorrect pour cette commande',
          order_id: validatedData.orderID,
        };
      }

      // Commande valide
      return {
        status: 'VALID_ORDER',
        message: 'Commande valide et prête pour le retrait',
        order_id: order.id,
        user_id: order.user_id,
        machine_id: order.machine_id,
        items: order.items,
        expires_at: order.expires_at,
        created_at: order.created_at,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          status: 'VALIDATION_ERROR',
          message: 'Données QR code invalides',
          errors: error.issues,
        });
      }

      if (error instanceof NotFoundException) {
        return {
          status: 'INVALID_ORDER',
          message: 'Commande introuvable',
          order_id: body.orderID,
        };
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue';
      throw new BadRequestException({
        status: 'VALIDATION_ERROR',
        message: 'Erreur lors de la validation de la commande',
        error: errorMessage,
      });
    }
  }

  @Post('validate-token')
  @ApiOperation({
    summary: 'Validate QR token',
    description: 'Validate a QR token for order pickup',
  })
  @ApiBody({ type: QRTokenDto })
  @ApiResponse({
    status: 200,
    description: 'QR token validation result',
    type: OrderValidationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid QR token' })
  async validateQRToken(@Body() body: QRTokenData) {
    try {
      // Validation des données d'entrée
      const validatedData = qrTokenSchema.parse(body);

      // Utiliser la méthode existante du service orders
      const order = await this.ordersService.validateQRCode(
        validatedData.qr_code_token,
      );

      return {
        status: 'VALID_ORDER',
        message: 'Commande valide et prête pour le retrait',
        order_id: order.id,
        user_id: order.user_id,
        machine_id: order.machine_id,
        expires_at: order.expires_at,
        created_at: order.created_at,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          status: 'VALIDATION_ERROR',
          message: 'Token QR invalide',
          errors: error.issues,
        });
      }

      if (error instanceof NotFoundException) {
        return {
          status: 'INVALID_ORDER',
          message: 'Token QR invalide ou commande introuvable',
        };
      }

      if (error instanceof BadRequestException) {
        return {
          status: 'INVALID_ORDER',
          message: error.message,
        };
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue';
      throw new BadRequestException({
        status: 'VALIDATION_ERROR',
        message: 'Erreur lors de la validation du token QR',
        error: errorMessage,
      });
    }
  }

  @Get('order/:orderId')
  @ApiOperation({
    summary: 'Get order status',
    description: 'Get the current status of an order',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order ID to check',
    example: 'order_123456789',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Order status retrieved successfully',
    type: OrderStatusResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid order ID' })
  async getOrderStatus(@Param('orderId') orderId: string) {
    try {
      const order = await this.ordersService.getOrderById(orderId);

      return {
        order_id: order.id,
        status: order.status,
        user_id: order.user_id,
        machine_id: order.machine_id,
        created_at: order.created_at,
        expires_at: order.expires_at,
        items: order.items,
        is_expired: new Date(order.expires_at) < new Date(),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          status: 'INVALID_ORDER',
          message: 'Commande introuvable',
          order_id: orderId,
        };
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue';
      throw new BadRequestException({
        status: 'ERROR',
        message: 'Erreur lors de la récupération de la commande',
        error: errorMessage,
      });
    }
  }
}
