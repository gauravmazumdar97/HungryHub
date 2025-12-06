import { Schema, model } from 'mongoose';

// 1. Define the Interface (The shape of the data)
export interface Food {
    id: string; // This is the virtual ID
    name: string;
    price: number;
    tags: string[];
    favorite: boolean;
    stars: number;
    imageUrl: string;
    origins: string[];
    cookTime: string;
    stock: number; // REQUIRED: Added stock for Inventory Management
}

// 2. Define the Schema using the Interface
export const FoodSchema = new Schema<Food>(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        tags: { type: [String] },
        favorite: { type: Boolean, default: false },
        stars: { type: Number, required: true },
        imageUrl: { type: String, required: true },
        origins: { type: [String], required: true },
        cookTime: { type: String, required: true },
        stock: { type: Number, default: 100 } // Default stock 100
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    }
);

// 3. Create the Model using the Interface
export const FoodModel = model<Food>('food', FoodSchema);