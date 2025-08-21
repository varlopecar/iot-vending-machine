import {
  Controller,
  Post,
  Body,
  Delete,
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
  ConfirmDeliveryDto,
  DeliveryResponseDto,
  DeleteOrderResponseDto,
  CancelOrderResponseDto,
} from '../dto/order-delivery.dto';
import {
  ValidationErrorDto,
  NotFoundErrorDto,
  BadRequestErrorDto,
} from '../dto/error.dto';

// Schema pour confirmer la livraison
const confirmDeliverySchema = z.object({
  order_id: z.string().min(1),
  machine_id: z.string().optional(), // Pour vérification croisée
  timestamp: z.string().optional(), // Timestamp de la livraison
  items_delivered: z
    .array(
      z.object({
        product_id: z.string(),
        slot_number: z.number(),
        quantity: z.number().int().positive(),
      }),
    )
    .optional(), // Pour vérifier que tous les produits ont été livrés
});

type ConfirmDeliveryData = z.infer<typeof confirmDeliverySchema>;

@ApiTags('order-delivery')
@Controller('api/order-delivery')
export class OrderDeliveryController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('confirm')
  @ApiOperation({
    summary: 'Confirm order delivery',
    description: 'Confirm that an order has been delivered to the customer',
  })
  @ApiBody({ type: ConfirmDeliveryDto })
  @ApiResponse({
    status: 200,
    description: 'Delivery confirmed successfully',
    type: DeliveryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid delivery data',
    type: ValidationErrorDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
    type: NotFoundErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: BadRequestErrorDto,
  })
  async confirmDelivery(@Body() body: ConfirmDeliveryData) {
    try {
      // Validation des données d'entrée
      const validatedData = confirmDeliverySchema.parse(body);

      // Récupérer la commande pour validation
      const order = await this.ordersService.getOrderById(
        validatedData.order_id,
      );

      if (!order) {
        return {
          status: 'DELIVERY_ERROR',
          message: 'Commande introuvable',
          order_id: validatedData.order_id,
        };
      }

      // Vérifier que la commande est dans le bon état
      if (order.status !== 'active') {
        return {
          status: 'DELIVERY_ERROR',
          message: `Impossible de livrer: commande dans l'état ${order.status}`,
          order_id: validatedData.order_id,
          current_status: order.status,
        };
      }

      // Vérification optionnelle de la machine
      if (
        validatedData.machine_id &&
        validatedData.machine_id !== order.machine_id
      ) {
        return {
          status: 'DELIVERY_ERROR',
          message: 'Machine incorrecte pour cette commande',
          order_id: validatedData.order_id,
          expected_machine: order.machine_id,
          provided_machine: validatedData.machine_id,
        };
      }

      // Vérification optionnelle des produits livrés
      if (validatedData.items_delivered) {
        const orderItemsMap = new Map();
        order.items.forEach((item) => {
          const key = `${item.product_id}-${item.slot_number}`;
          orderItemsMap.set(key, item.quantity);
        });

        for (const deliveredItem of validatedData.items_delivered) {
          const key = `${deliveredItem.product_id}-${deliveredItem.slot_number}`;
          const expectedQuantity = orderItemsMap.get(key);

          if (!expectedQuantity) {
            return {
              status: 'DELIVERY_ERROR',
              message: `Produit non commandé: ${deliveredItem.product_id} slot ${deliveredItem.slot_number}`,
              order_id: validatedData.order_id,
            };
          }

          if (deliveredItem.quantity !== expectedQuantity) {
            return {
              status: 'DELIVERY_ERROR',
              message: `Quantité incorrecte pour ${deliveredItem.product_id}: attendu ${expectedQuantity}, livré ${deliveredItem.quantity}`,
              order_id: validatedData.order_id,
            };
          }
        }
      }

      // Marquer la commande comme utilisée/livrée
      const updatedOrder = await this.ordersService.useOrder(
        validatedData.order_id,
      );

      return {
        status: 'DELIVERY_CONFIRMED',
        message: 'Commande livrée avec succès',
        order_id: updatedOrder.id,
        delivered_at: new Date().toISOString(),
        original_status: order.status,
        new_status: updatedOrder.status,
        items: order.items,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new BadRequestException({
          status: 'VALIDATION_ERROR',
          message: 'Données de livraison invalides',
          errors: error.issues,
        });
      }

      if (error instanceof NotFoundException) {
        return {
          status: 'DELIVERY_ERROR',
          message: 'Commande introuvable',
          order_id: body.order_id,
        };
      }

      if (error instanceof BadRequestException) {
        return {
          status: 'DELIVERY_ERROR',
          message: error.message,
          order_id: body.order_id,
        };
      }

      throw new BadRequestException({
        status: 'DELIVERY_ERROR',
        message: 'Erreur lors de la confirmation de livraison',
        error: error.message,
      });
    }
  }

  @Delete('order/:orderId')
  @ApiOperation({
    summary: 'Delete delivered order',
    description:
      'Archive a delivered order (marks as cancelled to preserve history)',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order ID to delete',
    example: 'order_123456789',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Order deleted successfully',
    type: DeleteOrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid order or operation' })
  async deleteDeliveredOrder(@Param('orderId') orderId: string) {
    try {
      // Récupérer la commande pour vérification
      const order = await this.ordersService.getOrderById(orderId);

      if (!order) {
        return {
          status: 'DELETE_ERROR',
          message: 'Commande introuvable',
          order_id: orderId,
        };
      }

      // Vérifier que la commande a été livrée
      if (order.status !== 'used') {
        return {
          status: 'DELETE_ERROR',
          message: `Impossible de supprimer: commande non livrée (statut: ${order.status})`,
          order_id: orderId,
          current_status: order.status,
        };
      }

      // plutôt que de supprimer complètement pour garder l'historique
      // Ici, on simule une suppression en mettant à jour le statut

      const archivedOrder = await this.ordersService.updateOrder(orderId, {
        status: 'cancelled', // Ou créer un nouveau statut 'ARCHIVED'
      });

      return {
        status: 'ORDER_DELETED',
        message: 'Commande supprimée avec succès',
        order_id: orderId,
        archived_at: new Date().toISOString(),
        previous_status: order.status,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          status: 'DELETE_ERROR',
          message: 'Commande introuvable',
          order_id: orderId,
        };
      }

      throw new BadRequestException({
        status: 'DELETE_ERROR',
        message: 'Erreur lors de la suppression de la commande',
        error: error.message,
      });
    }
  }

  @Post('cancel/:orderId')
  @ApiOperation({
    summary: 'Cancel order',
    description: 'Cancel an active order',
  })
  @ApiParam({
    name: 'orderId',
    description: 'Order ID to cancel',
    example: 'order_123456789',
    type: 'string',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
    type: CancelOrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid order or operation' })
  async cancelOrder(@Param('orderId') orderId: string) {
    try {
      // Annuler la commande (méthode existante)
      const cancelledOrder = await this.ordersService.cancelOrder(orderId);

      return {
        status: 'ORDER_CANCELLED',
        message: 'Commande annulée avec succès',
        order_id: cancelledOrder.id,
        cancelled_at: new Date().toISOString(),
        order_status: cancelledOrder.status,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          status: 'CANCEL_ERROR',
          message: 'Commande introuvable',
          order_id: orderId,
        };
      }

      if (error instanceof BadRequestException) {
        return {
          status: 'CANCEL_ERROR',
          message: error.message,
          order_id: orderId,
        };
      }

      throw new BadRequestException({
        status: 'CANCEL_ERROR',
        message: "Erreur lors de l'annulation de la commande",
        error: error.message,
      });
    }
  }
}
