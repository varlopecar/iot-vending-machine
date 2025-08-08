import { Product, Order } from '../types/product';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Coca-Cola',
    price: 2.50,
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
    price: 1.50,
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
    price: 2.00,
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
    price: 3.00,
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
export const mockOrders: Order[] = [
  {
    id: '1',
    date: '04/08/2025',
    items: [
      { id: '1', name: 'Coca-Cola', price: 2.50, image: require('../assets/images/coca.png'), quantity: 1 },
      { id: '2', name: 'Eau minérale', price: 1.50, image: require('../assets/images/eau.png'), quantity: 1 },
    ],
    totalPrice: 4.00,
    qrCode: require('../assets/images/qrcodeExample.png'),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    status: 'active',
  },
  {
    id: '2',
    date: '03/08/2025',
    items: [
      { id: '3', name: 'Chips nature', price: 2.00, image: require('../assets/images/chips.png'), quantity: 2 },
    ],
    totalPrice: 4.00,
    qrCode: require('../assets/images/qrcodeExample.png'),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    status: 'active',
  },
  {
    id: '3',
    date: '02/08/2025',
    items: [
      { id: '4', name: 'Kinder Bueno', price: 3.00, image: require('../assets/images/kinder.png'), quantity: 1 },
      { id: '1', name: 'Coca-Cola', price: 2.50, image: require('../assets/images/coca.png'), quantity: 1 },
    ],
    totalPrice: 5.50,
    qrCode: require('../assets/images/qrcodeExample.png'),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    status: 'active',
  },
];
