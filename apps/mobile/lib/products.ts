import { trpcQuery } from './api';

export type ServerProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  ingredients: string;
  allergens: string;
  nutritional_value: string;
  image_url: string;
  is_active: boolean;
};

export async function getAllProducts(): Promise<ServerProduct[]> {
  return trpcQuery<{}, ServerProduct[]>('products.getAllProducts', {});
}


