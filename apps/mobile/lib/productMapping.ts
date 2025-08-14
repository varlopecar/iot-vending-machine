import type { ServerProduct } from './products';

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // accents
    .replace(/[^a-z0-9\s-]/g, '') // ponctuation
    .replace(/\s+/g, ' ') // espaces multiples
    .trim();
}

// Mapping des libellés FR du front -> libellés (EN) du backend
// Les clés et valeurs sont normalisées (voir normalizeName)
const FR_TO_SERVER_NAME: Record<string, string> = {
  [normalizeName('Eau minérale')]: normalizeName('Water Bottle'),
  [normalizeName('Chips nature')]: normalizeName('Chips Classic'),
  [normalizeName('Coca-Cola')]: normalizeName('Coca-Cola'),
  [normalizeName('Kinder Bueno')]: normalizeName('Kinder Bueno'),
  [normalizeName("Barre énergétique")]: normalizeName('Energy Bar'),
};

const FR_LABELS: Record<string, string> = {
  [normalizeName('Eau minérale')]: 'Eau minérale',
  [normalizeName('Chips nature')]: 'Chips nature',
  [normalizeName('Coca-Cola')]: 'Coca-Cola',
  [normalizeName('Kinder Bueno')]: 'Kinder Bueno',
  [normalizeName('Barre énergétique')]: 'Barre énergétique',
};

const SERVER_TO_FR_NAME: Record<string, string> = Object.entries(FR_TO_SERVER_NAME).reduce(
  (acc, [frNorm, serverNorm]) => {
    acc[serverNorm] = frNorm;
    return acc;
  },
  {} as Record<string, string>,
);

export function resolveServerProductId(
  serverProducts: ServerProduct[],
  frontDisplayName: string,
): string | null {
  const normalizedFront = normalizeName(frontDisplayName);
  const mappedServerName = FR_TO_SERVER_NAME[normalizedFront] || normalizedFront;

  // Rechercher l'ID par nom normalisé
  const product = serverProducts.find((p) => normalizeName(p.name) === mappedServerName);
  return product ? product.id : null;
}

export function displayNameFromServerName(serverName: string): string {
  const serverNorm = normalizeName(serverName);
  const frNorm = SERVER_TO_FR_NAME[serverNorm];
  if (frNorm) return FR_LABELS[frNorm] || serverName;
  return serverName;
}


