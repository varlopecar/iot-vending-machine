import { trpcQuery } from './api';

export type Machine = {
  id: string;
  location: string;
  label: string;
  status: 'online' | 'offline' | 'maintenance' | 'out_of_service' | string;
  last_update: string;
};

export async function getAllMachines() {
  return trpcQuery<undefined, Machine[]>('machines.getAllMachines');
}


