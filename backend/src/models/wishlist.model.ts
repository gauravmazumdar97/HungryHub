import {Schema, model} from 'mongoose';

export interface Wishlist{
    id?: string;
    user: Schema.Types.ObjectId;
    food: Schema.Types.ObjectId;
    createdAt?: Date;
}

export const WishlistSchema = new Schema<Wishlist>(
    {
        user: {type: Schema.Types.ObjectId, ref: 'user', required: true},
        food: {type: Schema.Types.ObjectId, ref: 'food', required: true}
    },{
        toJSON:{
            virtuals: true
        },
        toObject:{
            virtuals: true
        },
        timestamps: true
    }
);

// Ensure one food item per user (prevent duplicates)
WishlistSchema.index({ user: 1, food: 1 }, { unique: true });

export const WishlistModel = model<Wishlist>('wishlist', WishlistSchema);

