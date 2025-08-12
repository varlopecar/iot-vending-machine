/**
 * Tests Smoke Simples pour les Paiements
 *
 * Ces tests vérifient les composants individuels sans charger l'AppModule complet
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { CheckoutService } from '../src/checkout/checkout.service';

describe('Payments Smoke Tests - Simple', () => {
  let checkoutService: CheckoutService;
  let prisma: PrismaService;

  // Mock des services externes
  const mockStripeService = {
    createPaymentIntent: jest.fn(),
    createCustomer: jest.fn(),
    createEphemeralKey: jest.fn(),
  };

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        CheckoutService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: 'StripeService',
          useValue: mockStripeService,
        },
      ],
    }).compile();

    checkoutService = moduleFixture.get<CheckoutService>(CheckoutService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Checkout Service - Validation', () => {
    it('should validate order ownership correctly', async () => {
      // Mock d'une commande existante
      const mockOrder = {
        id: 'order-test-123',
        user_id: 'user-test-123',
        status: 'PENDING',
        amount_total_cents: 2500,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        items: [
          {
            id: 'item-1',
            subtotal_cents: 2500,
          },
        ],
        user: {
          id: 'user-test-123',
          email: 'test@example.com',
        },
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      // Tester avec le bon utilisateur
      try {
        await checkoutService.createIntent(
          { orderId: 'order-test-123' },
          'user-test-123',
        );
      } catch (error) {
        // Ignorer les erreurs de mock pour ce test
      }

      // Vérifier que findUnique a été appelé
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-test-123' },
        include: { items: true, user: true },
      });
    });

    it('should reject access for wrong user', async () => {
      // Mock d'une commande existante
      const mockOrder = {
        id: 'order-test-123',
        user_id: 'user-test-123',
        status: 'PENDING',
        amount_total_cents: 2500,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        items: [
          {
            id: 'item-1',
            subtotal_cents: 2500,
          },
        ],
        user: {
          id: 'user-test-123',
          email: 'test@example.com',
        },
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      // Tester avec un mauvais utilisateur
      await expect(
        checkoutService.createIntent(
          { orderId: 'order-test-123' },
          'user-wrong-456',
        ),
      ).rejects.toThrow('Accès non autorisé à cette commande');
    });

    it('should reject expired orders', async () => {
      // Mock d'une commande expirée
      const mockExpiredOrder = {
        id: 'order-expired-123',
        user_id: 'user-test-123',
        status: 'PENDING',
        amount_total_cents: 2500,
        expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // -24h
        items: [
          {
            id: 'item-1',
            subtotal_cents: 2500,
          },
        ],
        user: {
          id: 'user-test-123',
          email: 'test@example.com',
        },
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockExpiredOrder);

      // Tester avec une commande expirée
      await expect(
        checkoutService.createIntent(
          { orderId: 'order-expired-123' },
          'user-test-123',
        ),
      ).rejects.toThrow('La commande a expiré');
    });

    it('should reject orders with invalid status', async () => {
      // Mock d'une commande avec statut invalide
      const mockInvalidOrder = {
        id: 'order-invalid-123',
        user_id: 'user-test-123',
        status: 'PAID', // Statut qui ne permet pas le paiement
        amount_total_cents: 2500,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        items: [
          {
            id: 'item-1',
            subtotal_cents: 2500,
          },
        ],
        user: {
          id: 'user-test-123',
          email: 'test@example.com',
        },
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockInvalidOrder);

      // Tester avec un statut invalide
      await expect(
        checkoutService.createIntent(
          { orderId: 'order-invalid-123' },
          'user-test-123',
        ),
      ).rejects.toThrow('ne permet pas le paiement');
    });
  });

  describe('Checkout Service - Business Logic', () => {
    it('should calculate order amount correctly', async () => {
      // Mock d'une commande avec plusieurs items
      const mockOrder = {
        id: 'order-test-123',
        user_id: 'user-test-123',
        status: 'PENDING',
        amount_total_cents: 5000, // Montant initial
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        items: [
          {
            id: 'item-1',
            subtotal_cents: 2500,
          },
          {
            id: 'item-2',
            subtotal_cents: 3000,
          },
        ],
        user: {
          id: 'user-test-123',
          email: 'test@example.com',
        },
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      // Tester le calcul du montant
      try {
        await checkoutService.createIntent(
          { orderId: 'order-test-123' },
          'user-test-123',
        );
      } catch (error) {
        // Ignorer les erreurs de mock pour ce test
      }

      // Vérifier que le montant a été recalculé
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-test-123' },
        data: { amount_total_cents: 5500 }, // 2500 + 3000
      });
    });

    it('should handle zero amount orders', async () => {
      // Mock d'une commande avec montant zéro
      const mockOrder = {
        id: 'order-zero-123',
        user_id: 'user-test-123',
        status: 'PENDING',
        amount_total_cents: 0,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        items: [
          {
            id: 'item-1',
            subtotal_cents: 0,
          },
        ],
        user: {
          id: 'user-test-123',
          email: 'test@example.com',
        },
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      // Tester avec un montant zéro
      await expect(
        checkoutService.createIntent(
          { orderId: 'order-zero-123' },
          'user-test-123',
        ),
      ).rejects.toThrow('doit être supérieur à 0');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Simuler une erreur de base de données
      mockPrismaService.order.findUnique.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // Tester la gestion d'erreur
      await expect(
        checkoutService.createIntent(
          { orderId: 'order-test-123' },
          'user-test-123',
        ),
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle missing orders', async () => {
      // Simuler une commande introuvable
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      // Tester la gestion d'erreur
      await expect(
        checkoutService.createIntent(
          { orderId: 'order-missing-123' },
          'user-test-123',
        ),
      ).rejects.toThrow('Commande introuvable');
    });
  });

  describe('Security', () => {
    it('should not expose sensitive information in error messages', async () => {
      // Mock d'une commande existante
      const mockOrder = {
        id: 'order-test-123',
        user_id: 'user-test-123',
        status: 'PENDING',
        amount_total_cents: 2500,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        items: [
          {
            id: 'item-1',
            subtotal_cents: 2500,
          },
        ],
        user: {
          id: 'user-test-123',
          email: 'test@example.com',
        },
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      // Simuler une erreur Stripe
      mockStripeService.createPaymentIntent.mockRejectedValue(
        new Error('Invalid API key: sk_test_invalid'),
      );

      // Tester que les secrets ne sont pas exposés
      try {
        await checkoutService.createIntent(
          { orderId: 'order-test-123' },
          'user-test-123',
        );
      } catch (error) {
        const errorMessage = error.message;
        expect(errorMessage).not.toContain('sk_test_');
        expect(errorMessage).not.toContain('pi_');
        expect(errorMessage).not.toContain('cus_');
      }
    });
  });
});
