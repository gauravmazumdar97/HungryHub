import {Router} from 'express';
import asyncHandler from 'express-async-handler';
import { HTTP_BAD_REQUEST } from '../constants/http_status';
import { WishlistModel } from '../models/wishlist.model';
import { FoodModel } from '../models/food.model';
import auth, { AuthRequest } from '../middlewares/auth.mid';

const router = Router();
router.use(auth);

// Get all wishlist items for current user
router.get('/my-wishlist', asyncHandler(
  async (req: AuthRequest, res) => {
    if (!req.user) {
      res.status(401).send('Unauthorized');
      return;
    }
    const wishlistItems = await WishlistModel.find({ user: req.user.id })
      .populate('food');
    
    res.send(wishlistItems);
  }
));

// Add food to wishlist
router.post('/add/:foodId', asyncHandler(
  async (req: AuthRequest, res) => {
    if (!req.user) {
      res.status(401).send('Unauthorized');
      return;
    }
    const { foodId } = req.params;
    const userId = req.user.id;

    // Check if food exists
    const food = await FoodModel.findById(foodId);
    if (!food) {
      res.status(HTTP_BAD_REQUEST).send('Food not found!');
      return;
    }

    // Check if already in wishlist
    const existingWishlist = await WishlistModel.findOne({ 
      user: userId, 
      food: foodId 
    });

    if (existingWishlist) {
      res.status(HTTP_BAD_REQUEST).send('Food already in wishlist!');
      return;
    }

    const wishlistItem = new WishlistModel({
      user: userId,
      food: foodId
    });

    await wishlistItem.save();
    await wishlistItem.populate('food');
    res.send(wishlistItem);
  }
));

// Remove food from wishlist
router.delete('/remove/:foodId', asyncHandler(
  async (req: AuthRequest, res) => {
    if (!req.user) {
      res.status(401).send('Unauthorized');
      return;
    }
    const { foodId } = req.params;
    const userId = req.user.id;

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

// Check if food is in wishlist
router.get('/check/:foodId', asyncHandler(
  async (req: AuthRequest, res) => {
    if (!req.user) {
      res.status(401).send('Unauthorized');
      return;
    }
    const { foodId } = req.params;
    const userId = req.user.id;

    const wishlistItem = await WishlistModel.findOne({
      user: userId,
      food: foodId
    });

    res.send({ isFavorite: !!wishlistItem });
  }
));

export default router;

