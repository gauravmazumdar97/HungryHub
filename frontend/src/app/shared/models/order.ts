import { CartItem } from "./cartsItems";

// Define a simple LatLng interface instead of using leaflet
export interface LatLng {
  lat: number;
  lng: number;
}

export class Order{
  id!:number;
  items!: CartItem[];
  totalPrice!:number;
  name!: string;
  address!: string;
  addressLatLng?:LatLng
  paymentId!: string;
  createdAt!: string;
  status!: string;
}