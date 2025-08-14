import { Product } from '../types/product';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Coca-Cola',
    price: 2.20,
    image: require('../assets/images/coca.png'),
    ingredients: ['Eau gazéifiée', 'Sucre', 'Colorant caramel', 'Acide phosphorique', 'Caféine', 'Arômes naturels'],
    allergens: ['Aucun allergène majeur'],
    nutritionalValues: {
      calories: 42,
      protein: 0,
      carbs: 10.6,
      fat: 0,
    },
  },
  {
    id: '2',
    name: 'Eau minérale',
    price: 1.10,
    image: require('../assets/images/eau.png'),
    ingredients: ['Eau minérale naturelle'],
    allergens: ['Aucun allergène'],
    nutritionalValues: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  },
  {
    id: '3',
    name: 'Chips nature',
    price: 1.30,
    image: require('../assets/images/chips.png'),
    ingredients: ['Pommes de terre', 'Huile de tournesol', 'Sel'],
    allergens: ['Aucun allergène majeur'],
    nutritionalValues: {
      calories: 536,
      protein: 6.5,
      carbs: 53,
      fat: 35,
    },
  },
  {
    id: '4',
    name: 'Kinder Bueno',
    price: 2.30,
    image: require('../assets/images/kinder.png'),
    ingredients: ['Chocolat au lait', 'Noisettes', 'Sucre', 'Lait en poudre', 'Beurre de cacao'],
    allergens: ['Lait', 'Noisettes', 'Soja'],
    nutritionalValues: {
      calories: 580,
      protein: 8.5,
      carbs: 48,
      fat: 40,
    },
  },
];

// Mock data pour les commandes
// Anciennes commandes mock supprimées (on utilise les vraies commandes backend)
