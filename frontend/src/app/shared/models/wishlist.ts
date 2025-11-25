import { Food } from './food';

export interface WishlistItem {
  id: string;
  user: string;
  food: Food;
  createdAt: string;
}

