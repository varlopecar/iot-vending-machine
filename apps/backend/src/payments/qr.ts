import { randomBytes } from 'crypto';

/**
 * Génère un token unique et sécurisé pour les QR codes
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
 * Valide qu'un token QR a le bon format
 * @param token - Token à valider
 * @returns true si le token est valide
 */
export function isValidQRToken(token: string): boolean {
  return typeof token === 'string' && 
         token.startsWith('qr_') && 
         token.length >= 35 && 
         token.length <= 43;
}
