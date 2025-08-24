import type { ImageSourcePropType } from 'react-native';

function normalizeName(name: string): string {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // accents
    .replace(/[^a-z0-9\s-]/g, '') // ponctuation
    .replace(/-/g, ' ') // tirets -> espaces
    .replace(/\s+/g, ' ') // espaces multiples
    .trim();
}

const placeholder: ImageSourcePropType = require('../assets/images/chips.png');

// Map de noms normalisés -> asset local
const IMAGE_BY_NAME: Record<string, ImageSourcePropType> = {
  // Boissons
  [normalizeName('Coca-Cola')]: require('../assets/images/coca.png'),
  [normalizeName('Coca Cola')]: require('../assets/images/coca.png'),

  [normalizeName('Water Bottle')]: require('../assets/images/eau.png'),
  [normalizeName('Eau minérale')]: require('../assets/images/eau.png'),
  [normalizeName('Eau minerale')]: require('../assets/images/eau.png'),

  // Snacks
  [normalizeName('Chips Classic')]: require('../assets/images/chips.png'),
  [normalizeName('Chips nature')]: require('../assets/images/chips.png'),

  [normalizeName('Kinder Bueno')]: require('../assets/images/kinder.png'),
};

export function getLocalImageForProductName(name?: string): ImageSourcePropType {
  if (!name) return placeholder;
  const key = normalizeName(name);
  return IMAGE_BY_NAME[key] ?? placeholder;
}


