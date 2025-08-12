/**
 * Configuration globale pour les tests smoke
 */

import { PrismaClient } from '@prisma/client';

// Configuration des tests
beforeAll(async () => {
  // Vérifier que la base de données est accessible
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log('✅ Base de données connectée pour les tests smoke');
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
});

// Configuration globale
beforeEach(() => {
  // Nettoyer les mocks avant chaque test
  jest.clearAllMocks();
});

afterEach(() => {
  // Nettoyer après chaque test
  jest.clearAllTimers();
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée dans les tests smoke:', reason);
  console.error('   Promise:', promise);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Exception non capturée dans les tests smoke:', error);
});

// Configuration des timeouts
jest.setTimeout(30000);

// Mock des services externes si nécessaire
jest.mock('../src/stripe/stripeClient', () => ({
  getStripeClient: jest.fn(),
  getStripePublishableKey: jest.fn(() => 'pk_test_mock'),
}));

// Configuration des variables d'environnement de test
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_mock';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock';
process.env.QR_SECRET_KEY = 'qr_secret_mock';
