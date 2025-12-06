import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { isValidObjectId } from 'mongoose';
import { HTTP_BAD_REQUEST } from '../constants/http_status';
import { WishlistModel } from '../models/wishlist.model';
import { FoodModel } from '../models/food.model';
import auth from '../middlewares/auth.mid';

const router = Router();
router.use(auth as any);

// 1. GET ALL (Fixed: Removes "Ghost" items where food was deleted)
router.get('/my-wishlist', asyncHandler(
  async (req: any, res) => {
    if (!req.user) {
      res.status(401).send('Unauthorized');
      return;
    }

    const wishlistItems = await WishlistModel.find({ user: req.user.id })
      .populate('food');

    // Filter out items where the 'food' reference is null 
    // (This happens if the food was deleted from the database but not the wishlist)
    const validWishlistItems = wishlistItems.filter(item => item.food !== null);
    
    res.send(validWishlistItems);
  }
));

// 2. ADD TO WISHLIST (Fixed: Handles Race Conditions via Unique Index)
router.post('/add/:foodId', asyncHandler(
  async (req: any, res) => {
    if (!req.user) {
      res.status(401).send('Unauthorized');
      return;
    }
    const { foodId } = req.params;
    const userId = req.user.id;

    // Validate ID format
    if (!isValidObjectId(foodId)) {
        res.status(HTTP_BAD_REQUEST).send('Invalid Food ID');
        return;
    }

    // Check if food exists
    const food = await FoodModel.findById(foodId);
    if (!food) {
      res.status(HTTP_BAD_REQUEST).send('Food not found!');
      return;
    }

    // We can rely on the Database Unique Index to prevent duplicates.
    // But we wrap it in a try/catch to handle that specific error gracefully.
    const wishlistItem = new WishlistModel({
      user: userId,
      food: foodId
    });

    try {
        await wishlistItem.save();
        await wishlistItem.populate('food');
        res.send(wishlistItem);
    } catch (error: any) {
        // Error Code 11000 = Duplicate Key Error in MongoDB
        if (error.code === 11000) {
            res.status(HTTP_BAD_REQUEST).send('Food already in wishlist!');
            return;
        }
        throw error;
    }
  }
));

// 3. REMOVE (Fixed: Basic validation)
router.delete('/remove/:foodId', asyncHandler(
  async (req: any, res) => {
    if (!req.user) {
      res.status(401).send('Unauthorized');
      return;
    }
    const { foodId } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(foodId)) {
        res.status(HTTP_BAD_REQUEST).send('Invalid Food ID');
        return;
    }

    const wishlistItem = await WishlistModel.findOneAndDelete({
      user: userId,
      food: foodId
    });

    if (!wishlistItem) {
      res.status(HTTP_BAD_REQUEST).send('Item not found in wishlist!');
      return;
    }

    res.send({ success: true, message: 'Item removed from wishlist' });
  }
));

// 4. CHECK STATUS
router.get('/check/:foodId', asyncHandler(
  async (req: any, res) => {
    if (!req.user) {
      res.status(401).send('Unauthorized');
      return;
    }
    const { foodId } = req.params;
    
    if (!isValidObjectId(foodId)) {
        res.send({ isFavorite: false });
        return;
    }

    const wishlistItem = await WishlistModel.findOne({
      user: req.user.id,
      food: foodId
    });

    res.send({ isFavorite: !!wishlistItem });
  }
));

export default router;