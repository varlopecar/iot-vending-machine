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


