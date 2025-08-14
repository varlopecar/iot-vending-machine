import { trpcQuery } from './api';

export async function getCurrentPoints(user_id: string): Promise<number> {
  return trpcQuery<{ user_id: string }, number>('loyalty.getCurrentPoints', { user_id });
}

export type LoyaltyHistoryEntry = {
  id: string;
  date: string;
  location: string;
  points: number;
};

export async function getLoyaltyHistory(user_id: string): Promise<LoyaltyHistoryEntry[]> {
  return trpcQuery<{ user_id: string }, LoyaltyHistoryEntry[]>('loyalty.getLoyaltyHistory', { user_id });
}


