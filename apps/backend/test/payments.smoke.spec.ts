/**
 * Tests Smoke pour les Paiements
 * 
 * Ces tests vérifient les chemins critiques du système de paiement
 * sans nécessiter l'application mobile complète.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { CheckoutService } from '../src/checkout/checkout.service';
import { StripeWebhookService } from '../src/webhooks/stripe-webhook.service';
import { StripeService } from '../src/stripe/stripe.service';
import { LoyaltyService } from '../src/loyalty/loyalty.service';
import { StocksService } from '../src/stocks/stocks.service';
import { AppModule } from '../src/app.module';

describe('Payments Smoke Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let checkoutService: CheckoutService;
  let webhookService: StripeWebhookService;
  let stripeService: StripeService;
  let loyaltyService: LoyaltyService;
  let stocksService: StocksService;

  // Fixtures de test
  const testUser = {
    id: 'user-test-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const testProduct = {
    id: 'product-test-123',
    name: 'Test Product',
    price_cents: 2500,
    stock_quantity: 10,
  };

  const testOrder = {
    id: 'order-test-123',
    user_id: 'user-test-123',
    status: 'PENDING',
    amount_total_cents: 2500,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24h
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    checkoutService = app.get<CheckoutService>(CheckoutService);
    webhookService = app.get<StripeWebhookService>(StripeWebhookService);
    stripeService = app.get<StripeService>(StripeService);
    loyaltyService = app.get<LoyaltyService>(LoyaltyService);
    stocksService = app.get<StocksService>(StocksService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Nettoyer la base de données de test
    await prisma.paymentEvent.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.loyaltyLog.deleteMany();
    await prisma.stock.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    // Créer les données de test
    await prisma.user.create({
      data: testUser,
    });

    await prisma.product.create({
      data: testProduct,
    });

    await prisma.order.create({
      data: testOrder,
    });

    await prisma.orderItem.create({
      data: {
        order_id: testOrder.id,
        product_id: testProduct.id,
        quantity: 1,
        unit_price_cents: testProduct.price_cents,
        subtotal_cents: testProduct.price_cents,
      },
    });

    await prisma.stock.create({
      data: {
        product_id: testProduct.id,
        machine_id: 'machine-test-123',
        quantity: testProduct.stock_quantity,
      },
    });
  });

  describe('Checkout Service', () => {
    it('should create payment intent with correct data', async () => {
      // Mock du service Stripe
      jest.spyOn(stripeService, 'createPaymentIntent').mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_secret_123',
        amount: 2500,
        currency: 'eur',
        status: 'requires_payment_method',
        metadata: { orderId: testOrder.id },
      } as any);

      jest.spyOn(stripeService, 'createCustomer').mockResolvedValue({
        id: 'cus_test_123',
        email: testUser.email,
      } as any);

      jest.spyOn(stripeService, 'createEphemeralKey').mockResolvedValue({
        secret: 'ek_test_123',
      } as any);

      const result = await checkoutService.createIntent(
        { orderId: testOrder.id },
        testUser.id,
      );

      expect(result).toBeDefined();
      expect(result.paymentIntentClientSecret).toBe('pi_test_secret_123');
      expect(result.customerId).toBe('cus_test_123');
      expect(result.ephemeralKey).toBe('ek_test_123');
      expect(result.publishableKey).toBeDefined();
    });

    it('should validate order ownership', async () => {
      const wrongUserId = 'user-wrong-456';

      await expect(
        checkoutService.createIntent(
          { orderId: testOrder.id },
          wrongUserId,
        ),
      ).rejects.toThrow('Accès non autorisé à cette commande');
    });

    it('should reject expired orders', async () => {
      // Créer une commande expirée
      const expiredOrder = await prisma.order.create({
        data: {
          ...testOrder,
          id: 'order-expired-123',
          expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // -24h
        },
      });

      await expect(
        checkoutService.createIntent(
          { orderId: expiredOrder.id },
          testUser.id,
        ),
      ).rejects.toThrow('La commande a expiré');
    });
  });

  describe('Webhook Processing', () => {
    it('should process payment_intent.succeeded correctly', async () => {
      // Créer un paiement en attente
      const payment = await prisma.payment.create({
        data: {
          order_id: testOrder.id,
          stripe_payment_intent_id: 'pi_test_123',
          amount_cents: 2500,
          currency: 'EUR',
          status: 'requires_payment_method',
        },
      });

      // Mock de l'événement Stripe
      const mockEvent = {
        id: 'evt_test_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 2500,
            currency: 'eur',
            metadata: { orderId: testOrder.id },
            customer: 'cus_test_123',
          },
        },
      };

      // Traiter le webhook
      await webhookService.handleWebhook(mockEvent as any);

      // Vérifier les mises à jour
      const updatedOrder = await prisma.order.findUnique({
        where: { id: testOrder.id },
      });

      const updatedPayment = await prisma.payment.findUnique({
        where: { id: payment.id },
      });

      const loyaltyLogs = await prisma.loyaltyLog.findMany({
        where: { user_id: testUser.id },
      });

      expect(updatedOrder?.status).toBe('PAID');
      expect(updatedPayment?.status).toBe('succeeded');
      expect(loyaltyLogs).toHaveLength(1);
      expect(loyaltyLogs[0].points).toBeGreaterThan(0);
    });

    it('should handle idempotence correctly', async () => {
      // Créer un paiement déjà traité
      await prisma.payment.create({
        data: {
          order_id: testOrder.id,
          stripe_payment_intent_id: 'pi_test_123',
          amount_cents: 2500,
          currency: 'EUR',
          status: 'succeeded',
        },
      });

      await prisma.order.update({
        where: { id: testOrder.id },
        data: { status: 'PAID' },
      });

      // Créer des logs de fidélité existants
      await prisma.loyaltyLog.create({
        data: {
          user_id: testUser.id,
          points: 25,
          type: 'PURCHASE',
          description: 'Achat test',
          metadata: { orderId: testOrder.id },
        },
      });

      const initialLoyaltyLogs = await prisma.loyaltyLog.count({
        where: { user_id: testUser.id },
      });

      // Mock de l'événement Stripe (même événement)
      const mockEvent = {
        id: 'evt_test_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 2500,
            currency: 'eur',
            metadata: { orderId: testOrder.id },
            customer: 'cus_test_123',
          },
        },
      };

      // Traiter le webhook deux fois
      await webhookService.handleWebhook(mockEvent as any);
      await webhookService.handleWebhook(mockEvent as any);

      // Vérifier qu'il n'y a pas de doublons
      const finalLoyaltyLogs = await prisma.loyaltyLog.count({
        where: { user_id: testUser.id },
      });

      expect(finalLoyaltyLogs).toBe(initialLoyaltyLogs);
    });

    it('should handle payment failures correctly', async () => {
      // Mock de l'événement d'échec
      const mockEvent = {
        id: 'evt_test_123',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 2500,
            currency: 'eur',
            metadata: { orderId: testOrder.id },
            last_payment_error: {
              message: 'Carte refusée',
              code: 'card_declined',
            },
          },
        },
      };

      // Traiter le webhook
      await webhookService.handleWebhook(mockEvent as any);

      // Vérifier que la commande n'a pas changé
      const updatedOrder = await prisma.order.findUnique({
        where: { id: testOrder.id },
      });

      expect(updatedOrder?.status).toBe('PENDING');
    });
  });

  describe('Stock Management', () => {
    it('should decrement stock atomically on successful payment', async () => {
      const initialStock = await prisma.stock.findFirst({
        where: { product_id: testProduct.id },
      });

      expect(initialStock?.quantity).toBe(10);

      // Simuler un paiement réussi
      await prisma.payment.create({
        data: {
          order_id: testOrder.id,
          stripe_payment_intent_id: 'pi_test_123',
          amount_cents: 2500,
          currency: 'EUR',
          status: 'succeeded',
        },
      });

      await prisma.order.update({
        where: { id: testOrder.id },
        data: { status: 'PAID' },
      });

      // Traiter le webhook
      const mockEvent = {
        id: 'evt_test_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 2500,
            currency: 'eur',
            metadata: { orderId: testOrder.id },
            customer: 'cus_test_123',
          },
        },
      };

      await webhookService.handleWebhook(mockEvent as any);

      // Vérifier que le stock a été décrémenté
      const updatedStock = await prisma.stock.findFirst({
        where: { product_id: testProduct.id },
      });

      expect(updatedStock?.quantity).toBe(9);
    });

    it('should rollback stock changes on insufficient quantity', async () => {
      // Forcer un stock insuffisant
      await prisma.stock.update({
        where: { id: (await prisma.stock.findFirst())!.id },
        data: { quantity: 0 },
      });

      // Tenter de traiter un paiement
      const mockEvent = {
        id: 'evt_test_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 2500,
            currency: 'eur',
            metadata: { orderId: testOrder.id },
            customer: 'cus_test_123',
          },
        },
      };

      // Le webhook devrait échouer et ne pas modifier le stock
      await expect(
        webhookService.handleWebhook(mockEvent as any),
      ).rejects.toThrow();

      const stock = await prisma.stock.findFirst({
        where: { product_id: testProduct.id },
      });

      expect(stock?.quantity).toBe(0);
    });
  });

  describe('Loyalty System', () => {
    it('should credit loyalty points correctly', async () => {
      // Simuler un paiement réussi
      await prisma.payment.create({
        data: {
          order_id: testOrder.id,
          stripe_payment_intent_id: 'pi_test_123',
          amount_cents: 2500,
          currency: 'EUR',
          status: 'succeeded',
        },
      });

      // Traiter le webhook
      const mockEvent = {
        id: 'evt_test_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_123',
            amount: 2500,
            currency: 'eur',
            metadata: { orderId: testOrder.id },
            customer: 'cus_test_123',
          },
        },
      };

      await webhookService.handleWebhook(mockEvent as any);

      // Vérifier les points de fidélité
      const loyaltyLogs = await prisma.loyaltyLog.findMany({
        where: { user_id: testUser.id },
      });

      expect(loyaltyLogs).toHaveLength(1);
      expect(loyaltyLogs[0].type).toBe('PURCHASE');
      expect(loyaltyLogs[0].points).toBeGreaterThan(0);
      expect(loyaltyLogs[0].metadata.orderId).toBe(testOrder.id);
    });
  });

  describe('Error Handling', () => {
    it('should not expose secrets in logs', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      try {
        // Tenter de créer un intent (cela échouera sans mock)
        await checkoutService.createIntent(
          { orderId: 'invalid-order' },
          testUser.id,
        );
      } catch (error) {
        // Ignorer l'erreur attendue
      }

      // Vérifier qu'aucun secret n'est loggé
      const logs = consoleSpy.mock.calls.flat().join(' ');
      expect(logs).not.toContain('sk_');
      expect(logs).not.toContain('pi_');
      expect(logs).not.toContain('cus_');

      consoleSpy.mockRestore();
    });

    it('should handle database connection errors gracefully', async () => {
      // Simuler une erreur de base de données
      jest.spyOn(prisma.order, 'findUnique').mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(
        checkoutService.createIntent(
          { orderId: testOrder.id },
          testUser.id,
        ),
      ).rejects.toThrow();

      jest.restoreAllMocks();
    });
  });
});
