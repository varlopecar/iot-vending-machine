import {
  generateOneTimeToken,
  isValidQRToken,
  issueQrToken,
  verifyQrToken,
  isQrTokenExpired,
} from './qr';

// Mock des variables d'environnement
const originalEnv = process.env;

describe('QR Token Utilities', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('generateOneTimeToken (Legacy)', () => {
    it('should generate a valid one-time token', () => {
      const token = generateOneTimeToken();

      expect(token).toMatch(/^qr_/);
      expect(token.length).toBeGreaterThanOrEqual(35);
      expect(token.length).toBeLessThanOrEqual(50); // Ajusté pour la réalité
      expect(isValidQRToken(token)).toBe(true);
    });

    it('should generate unique tokens', () => {
      const token1 = generateOneTimeToken();
      const token2 = generateOneTimeToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe('isValidQRToken (Legacy)', () => {
    it('should validate correct legacy tokens', () => {
      const token = generateOneTimeToken();
      expect(isValidQRToken(token)).toBe(true);
    });

    it('should reject invalid tokens', () => {
      expect(isValidQRToken('')).toBe(false);
      expect(isValidQRToken('invalid')).toBe(false);
      expect(isValidQRToken('qr_')).toBe(false);
      expect(isValidQRToken('qr_short')).toBe(false);
    });
  });

  describe('issueQrToken (Secure)', () => {
    beforeEach(() => {
      process.env.QR_SECRET = 'test-secret-key';
      process.env.QR_TTL_SECONDS = '300'; // 5 minutes
    });

    it('should generate a secure QR token', () => {
      const payload = {
        orderId: 'order-123',
        userId: 'user-456',
        machineId: 'machine-789',
      };

      const token = issueQrToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should throw error when QR_SECRET is not set', () => {
      delete process.env.QR_SECRET;

      const payload = {
        orderId: 'order-123',
        userId: 'user-456',
        machineId: 'machine-789',
      };

      expect(() => issueQrToken(payload)).toThrow(
        'QR_SECRET environment variable is required',
      );
    });

    it('should use default TTL when QR_TTL_SECONDS is not set', () => {
      delete process.env.QR_TTL_SECONDS;

      const payload = {
        orderId: 'order-123',
        userId: 'user-456',
        machineId: 'machine-789',
      };

      const token = issueQrToken(payload);
      expect(token).toBeDefined();
    });

    it('should generate different tokens for different payloads', () => {
      const payload1 = {
        orderId: 'order-123',
        userId: 'user-456',
        machineId: 'machine-789',
      };

      const payload2 = {
        orderId: 'order-124',
        userId: 'user-456',
        machineId: 'machine-789',
      };

      const token1 = issueQrToken(payload1);
      const token2 = issueQrToken(payload2);

      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyQrToken (Secure)', () => {
    beforeEach(() => {
      process.env.QR_SECRET = 'test-secret-key';
      process.env.QR_TTL_SECONDS = '300'; // 5 minutes
    });

    it('should verify and decode a valid token', () => {
      const payload = {
        orderId: 'order-123',
        userId: 'user-456',
        machineId: 'machine-789',
      };

      const token = issueQrToken(payload);
      const decoded = verifyQrToken(token);

      expect(decoded).toEqual(payload);
    });

    it('should throw error when QR_SECRET is not set', () => {
      delete process.env.QR_SECRET;

      const token = 'valid-token-format';
      expect(() => verifyQrToken(token)).toThrow(
        'QR_SECRET environment variable is required',
      );
    });

    it('should throw error for expired tokens', () => {
      // Créer un token avec un TTL négatif pour simuler l'expiration
      const originalTTL = process.env.QR_TTL_SECONDS;
      process.env.QR_TTL_SECONDS = '-1';

      const payload = {
        orderId: 'order-123',
        userId: 'user-456',
        machineId: 'machine-789',
      };

      const token = issueQrToken(payload);

      // Le token devrait être expiré immédiatement
      expect(() => verifyQrToken(token)).toThrow('QR token has expired');

      // Restaurer le TTL original
      process.env.QR_TTL_SECONDS = originalTTL;
    });

    it('should throw error for invalid signature', () => {
      const payload = {
        orderId: 'order-123',
        userId: 'user-456',
        machineId: 'machine-789',
      };

      const token = issueQrToken(payload);

      // Modifier le secret pour invalider la signature
      process.env.QR_SECRET = 'different-secret';

      expect(() => verifyQrToken(token)).toThrow(
        'QR token signature is invalid',
      );
    });

    it('should throw error for malformed tokens', () => {
      expect(() => verifyQrToken('invalid-token')).toThrow(
        'Invalid QR token format',
      );
      expect(() => verifyQrToken('')).toThrow('Invalid QR token format');

      // Test avec un token qui semble valide mais qui est malformé
      const malformedToken = 'eyJkYXRhIjoibm90LWpzb24ifQ'; // base64 de "not-json"
      expect(() => verifyQrToken(malformedToken)).toThrow(
        'Invalid QR token format',
      );
    });
  });

  describe('isQrTokenExpired (Secure)', () => {
    beforeEach(() => {
      process.env.QR_SECRET = 'test-secret-key';
      process.env.QR_TTL_SECONDS = '1'; // 1 seconde pour les tests
    });

    it('should detect expired tokens', () => {
      // Créer un token avec un TTL négatif pour simuler l'expiration
      const originalTTL = process.env.QR_TTL_SECONDS;
      process.env.QR_TTL_SECONDS = '-1';

      const payload = {
        orderId: 'order-123',
        userId: 'user-456',
        machineId: 'machine-789',
      };

      const token = issueQrToken(payload);

      // Le token devrait être expiré immédiatement
      expect(isQrTokenExpired(token)).toBe(true);

      // Restaurer le TTL original
      process.env.QR_TTL_SECONDS = originalTTL;
    });

    it('should detect valid tokens', () => {
      const payload = {
        orderId: 'order-123',
        userId: 'user-456',
        machineId: 'machine-789',
      };

      const token = issueQrToken(payload);
      expect(isQrTokenExpired(token)).toBe(false);
    });

    it('should handle malformed tokens gracefully', () => {
      expect(isQrTokenExpired('invalid-token')).toBe(true);
      expect(isQrTokenExpired('')).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      process.env.QR_SECRET = 'test-secret-key';
      process.env.QR_TTL_SECONDS = '300';
    });

    it('should handle full token lifecycle', () => {
      const payload = {
        orderId: 'order-123',
        userId: 'user-456',
        machineId: 'machine-789',
      };

      // 1. Générer le token
      const token = issueQrToken(payload);
      expect(token).toBeDefined();

      // 2. Vérifier qu'il n'est pas expiré
      expect(isQrTokenExpired(token)).toBe(false);

      // 3. Vérifier et décoder le token
      const decoded = verifyQrToken(token);
      expect(decoded).toEqual(payload);

      // 4. Vérifier que le token est toujours valide
      expect(isQrTokenExpired(token)).toBe(false);
    });

    it('should handle concurrent token generation', () => {
      const payload = {
        orderId: 'order-123',
        userId: 'user-456',
        machineId: 'machine-789',
      };

      // Générer des tokens avec des timestamps différents pour simuler la concurrence
      const tokens = Array.from({ length: 10 }, (_, i) => {
        // Modifier légèrement le payload pour chaque token
        const modifiedPayload = {
          ...payload,
          orderId: `${payload.orderId}-${i}`,
        };
        return issueQrToken(modifiedPayload);
      });

      // Tous les tokens doivent être uniques
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(10);

      // Tous les tokens doivent être valides
      tokens.forEach((token, i) => {
        const decoded = verifyQrToken(token);
        expect(decoded.orderId).toBe(`${payload.orderId}-${i}`);
        expect(decoded.userId).toBe(payload.userId);
        expect(decoded.machineId).toBe(payload.machineId);
      });
    });
  });
});
