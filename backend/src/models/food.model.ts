import {Schema, model} from 'mongoose';

// Ensure your Food model in the frontend also includes 'inventory_quantity'
export interface Food{
    id:string;
    name:string;
    price:number;
    tags: string[];
    favorite:boolean;
    imageUrl: string;
    origins: string[];
    cookTime:string;
    // 🔑 ADDED FOR INVENTORY MANAGEMENT
    inventory_quantity: number; 
}

export const FoodSchema = new Schema<Food>(
    {
        name: {type: String, required:true},
        price: {type: Number, required:true},
        tags: {type: [String]},
        favorite: {type: Boolean, default:false},
        imageUrl: {type: String, required:true},
        origins: {type: [String], required:true},
        cookTime: {type: String, required:true},
        
        // 🔑 SCHEMA DEFINITION FOR INVENTORY
        inventory_quantity: { 
            type: Number, 
            required: true, 
            default: 0,
            min: 0      
        }
    },{
        toJSON:{
            virtuals: true
        },
        toObject:{
            virtuals: true
        },
        timestamps:true
    }
);

export const FoodModel = model<Food>('food', FoodSchema);
