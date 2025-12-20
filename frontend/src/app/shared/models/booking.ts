import { CartItem } from "./cartsItems"; // Make sure this import path matches your file structure

export class Booking {
    name!: string;
    email!: string;
    phone!: string;
    date!: string;
    time!: string;
    guests!: number;
    type!: 'standard' | 'preorder' | 'hall';
    
    // Optional fields
    hallPackage?: string; 
    cartItems?: CartItem[]; 
    
    // The missing fields causing your error:
    totalPrice?: number; 
    status?: string;     
}