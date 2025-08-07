import { Product } from '../types/product';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Kinder-bueno',
    price: 1,
    image: require('../assets/images/kinder.png'),
    ingredients: [
      'Chocolat au lait (32%)',
      'Sucre',
      'Huile de palme',
      'Farine de blé',
      'Lait écrémé en poudre',
      'Beurre de cacao',
      'Pâte de cacao',
      'Lactose',
      'Lécithine de soja',
      'Sel',
      'Levure',
      'Vanilline'
    ],
    allergens: [
      'Gluten (blé, orge)',
      'Lait et produits laitiers',
      'Soja',
      'Oeufs'
    ],
    nutritionalValues: {
      calories: 580,
      protein: 8.5,
      carbs: 58,
      fat: 35
    }
  },
  {
    id: '2',
    name: 'Coca-Cola',
    price: 1,
    image: require('../assets/images/coca.png'),
    ingredients: [
      'Eau gazéifiée',
      'Sucre',
      'Colorant : caramel (E150d)',
      'Acidifiant : acide phosphorique',
      'Arômes naturels (extraits végétaux)',
      'Caféine'
    ],
    allergens: [
      'Aucun allergène majeur'
    ],
    nutritionalValues: {
      calories: 42,
      protein: 0,
      carbs: 10.6,
      fat: 0
    }
  },
  {
    id: '3',
    name: 'Chips',
    price: 2,
    image: require('../assets/images/chips.png'),
    ingredients: [
      'Pommes de terre',
      'Huile de tournesol',
      'Sel',
      'Arômes naturels',
      'Protéines de lait',
      'Lactose',
      'Extrait de levure'
    ],
    allergens: [
      'Lait et produits laitiers'
    ],
    nutritionalValues: {
      calories: 536,
      protein: 6.5,
      carbs: 53,
      fat: 32
    }
  },
  {
    id: '4',
    name: 'Eau',
    price: 1,
    image: require('../assets/images/eau.png'),
    ingredients: [
      'Eau minérale naturelle'
    ],
    allergens: [
      'Aucun allergène'
    ],
    nutritionalValues: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    }
  }
];
