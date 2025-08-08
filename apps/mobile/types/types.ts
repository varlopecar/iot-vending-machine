export interface Advantage {
  id: string;
  title: string;
  description?: string;
  points: number;
  image: string; // image file name (e.g., 'ptit_duo.png')
}

export interface HistoryEntry {
  id: string;
  date: string;
  location: string;
  points: number;
}
