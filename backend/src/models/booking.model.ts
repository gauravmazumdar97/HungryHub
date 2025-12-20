import { Schema, model } from 'mongoose';

export interface Booking {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  type: string;          // 'standard', 'preorder', 'hall'
  hallPackage?: string;  // 'Silver', 'Gold', 'Platinum' (Optional)
  cartItems?: any[];     // Stores the food list (Optional)
  totalPrice?: number;   // Good to save the price if pre-ordering
  status: string;
}

export const BookingSchema = new Schema<Booking>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true }, // Stores the start time (e.g., "20:00")
    guests: { type: Number, required: true },
    type: { type: String, required: true },
    hallPackage: { type: String, default: '' },
    cartItems: { type: Array, default: [] },
    totalPrice: { type: Number, default: 0 },
    status: { type: String, default: 'pending' }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

export const BookingModel = model<Booking>('booking', BookingSchema);