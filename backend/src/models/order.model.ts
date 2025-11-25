import {Schema, model} from 'mongoose';

export interface OrderItem {
  food: Schema.Types.ObjectId;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  totalPrice: number;
  name: string;
  address: string;
  addressLatLng?: {
    lat: number;
    lng: number;
  };
  paymentId: string;
  status: string;
  user: Schema.Types.ObjectId;
  createdAt: Date;
}

export const OrderSchema = new Schema<Order>(
  {
    items: [{
      food: { type: Schema.Types.ObjectId, ref: 'food', required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true }
    }],
    totalPrice: { type: Number, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    addressLatLng: {
      lat: { type: Number },
      lng: { type: Number }
    },
    paymentId: { type: String },
    status: { type: String, default: 'NEW' },
    user: { type: Schema.Types.ObjectId, ref: 'user', required: true }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true
    },
    toObject: {
      virtuals: true
    }
  }
);

export const OrderModel = model<Order>('order', OrderSchema);

