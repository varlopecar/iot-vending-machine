export interface Product {
  id: string;
  name: string;
  price: number;
  image: any;
  ingredients: string[];
  allergens: string[];
  nutritionalValues: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: any;
  quantity: number;
}

export interface AppliedOffer {
  id: string;
  name: string;
  description: string;
  itemName: string;
}
