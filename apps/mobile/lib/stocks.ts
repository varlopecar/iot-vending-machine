import { trpcQuery } from './api';

export type Stock = {
  id: string;
  machine_id: string;
  product_id: string;
  quantity: number;
  slot_number: number;
};

export async function getStockByMachineAndProduct(machine_id: string, product_id: string) {
  return trpcQuery<{ machine_id: string; product_id: string }, Stock | null>(
    'stocks.getStockByMachineAndProduct',
    { machine_id, product_id },
  );
}

export type StockWithProduct = Stock & {
  product_name: string;
  product_price: number;
  product_image_url?: string;
  product_ingredients_list?: string[];
  product_allergens_list?: string[];
  product_nutritional?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    serving?: string;
  };
};

export async function getStocksByMachine(machine_id: string) {
  return trpcQuery<{ machine_id: string }, StockWithProduct[]>(
    'stocks.getStocksByMachine',
    { machine_id },
  );
}


