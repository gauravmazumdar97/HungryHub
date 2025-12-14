export class Booking {
  name!: string;
  email!: string;
  phone!: string;
  date!: string;
  time!: string;
  guests!: number;
  type!: 'standard' | 'preorder' | 'hall';
  hallPackage?: 'Silver' | 'Gold' | 'Platinum';
  cartItems?: any[];
}