import { Schema, model } from 'mongoose';

export interface Coupon {
  code: string;
  discountPercent: number; // Matches your database field
  isActive: boolean;
}

export const CouponSchema = new Schema<Coupon>(
  {
    code: { type: String, required: true, unique: true },
    discountPercent: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const CouponModel = model<Coupon>('coupon', CouponSchema);