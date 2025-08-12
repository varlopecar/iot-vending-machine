import { randomBytes, createHmac, timingSafeEqual } from 'crypto';

// Types pour les tokens QR sécurisés
export interface QrTokenPayload {
  orderId: string;
  userId: string;
  machineId: string;
}

export interface QrTokenData {
  data: QrTokenPayload;
  exp: number; // Timestamp d'expiration
  sig: string; // Signature HMAC
}

/**
 * Génère un token unique et sécurisé pour les QR codes (usage interne)
 * @returns Token URL-safe de 32-40 caractères
 */
export function generateOneTimeToken(): string {
  // Générer 32 bytes aléatoires et les convertir en base64
  const randomBytesBuffer = randomBytes(32);
  const base64Token = randomBytesBuffer.toString('base64');

  // Rendre URL-safe en remplaçant les caractères problématiques
  const urlSafeToken = base64Token
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Ajouter un préfixe pour identifier le type de token
  return `qr_${urlSafeToken}`;
}

/**
 * Valide qu'un token QR a le bon format (usage interne)
 * @param token - Token à valider
 * @returns true si le token est valide
 */
export function isValidQRToken(token: string): boolean {
  return (
    typeof token === 'string' &&
    token.startsWith('qr_') &&
    token.length >= 35 &&
    token.length <= 50
  ); // Ajusté pour la réalité
}

/**
 * Génère un token QR sécurisé avec TTL et signature HMAC
 * @param payload - Données à encoder dans le token
 * @returns Token sécurisé compact en base64url
 */
export function issueQrToken(payload: QrTokenPayload): string {
  const secret = process.env.QR_SECRET;
  if (!secret) {
    throw new Error('QR_SECRET environment variable is required');
  }

  const ttlSeconds = parseInt(process.env.QR_TTL_SECONDS || '600', 10);
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;

  const tokenData: QrTokenData = {
    data: payload,
    exp,
    sig: '', // Sera calculé
  };

  // Créer la signature HMAC
  const message = JSON.stringify({ data: payload, exp });
  const hmac = createHmac('sha256', secret);
  hmac.update(message);
  const signature = hmac
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  tokenData.sig = signature;

  // Encoder en base64url compact
  const jsonString = JSON.stringify(tokenData);
  const base64 = Buffer.from(jsonString, 'utf8').toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Vérifie et décode un token QR sécurisé
 * @param token - Token à vérifier
 * @returns Payload décodé si valide
 * @throws Error si le token est invalide ou expiré
 */
export function verifyQrToken(token: string): QrTokenPayload {
  const secret = process.env.QR_SECRET;
  if (!secret) {
    throw new Error('QR_SECRET environment variable is required');
  }

  try {
    // Décoder le base64url
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');

    // Ajouter le padding si nécessaire
    const paddedBase64 = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

    const jsonString = Buffer.from(paddedBase64, 'base64').toString('utf8');
    const tokenData: QrTokenData = JSON.parse(jsonString);

    // Vérifier l'expiration
    const now = Math.floor(Date.now() / 1000);
    if (now > tokenData.exp) {
      throw new Error('QR token has expired');
    }

    // Vérifier la signature HMAC
    const message = JSON.stringify({
      data: tokenData.data,
      exp: tokenData.exp,
    });
    const hmac = createHmac('sha256', secret);
    hmac.update(message);
    const expectedSignature = hmac
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Utiliser timingSafeEqual pour éviter les attaques par timing
    if (
      !timingSafeEqual(
        Buffer.from(tokenData.sig, 'utf8'),
        Buffer.from(expectedSignature, 'utf8'),
      )
    ) {
      throw new Error('QR token signature is invalid');
    }

    return tokenData.data;
  } catch (error) {
    if (error instanceof Error) {
      // Si c'est une erreur de parsing JSON, c'est un token malformé
      if (error.message.includes('Unexpected token') || error.message.includes('JSON')) {
        throw new Error('Invalid QR token format');
      }
      throw error;
    }
    throw new Error('Invalid QR token format');
  }
}

/**
 * Vérifie si un token QR est expiré sans vérifier la signature
 * @param token - Token à vérifier
 * @returns true si le token est expiré
 */
export function isQrTokenExpired(token: string): boolean {
  try {
    const base64 = token.replace(/-/g, '+').replace(/_/g, '/');

    const paddedBase64 = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const jsonString = Buffer.from(paddedBase64, 'base64').toString('utf8');
    const tokenData: QrTokenData = JSON.parse(jsonString);

    const now = Math.floor(Date.now() / 1000);
    return now > tokenData.exp;
  } catch {
    return true; // Considérer comme expiré si on ne peut pas le décoder
  }
}
