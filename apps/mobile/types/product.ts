export interface Product {
  id: string;
  name: string;
  price: number;
  image: any;
  category?: 'snack' | 'drink';
  ingredients: string[];
  allergens: string[];
  nutritionalValues: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  stockQty?: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: any;
  quantity: number;
  fromOfferId?: string; // identifie si l'item provient d'une offre
}

export interface AppliedOffer {
  id: string;
  key: 'petit_snack' | 'gros_snack' | 'ptit_duo' | 'mix_parfait' | 'gourmand';
  name: string;
  description?: string;
  points: number;
  items: { id: string; name: string; quantity: number }[];
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  totalPrice: number;

  qrCodeImage?: any;
  qrCodeToken?: string;
  expiresAt: Date;
  status: 'active' | 'expired' | 'used' | 'cancelled';
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: any;
}
