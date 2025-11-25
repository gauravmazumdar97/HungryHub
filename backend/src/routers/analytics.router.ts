import {Router} from 'express';
import asyncHandler from 'express-async-handler';
import { OrderModel } from '../models/order.model';
import { FoodModel } from '../models/food.model';
import { WishlistModel } from '../models/wishlist.model';
import { UserModel } from '../models/user.model';
import auth, { AuthRequest } from '../middlewares/auth.mid';
import { OrderStatus } from '../constants/order_status';

const router = Router();
router.use(auth);

// Get dashboard analytics
router.get('/dashboard', asyncHandler(
  async (req: AuthRequest, res) => {
    if (!req.user) {
      res.status(401).send('Unauthorized');
      return;
    }
    const userId = req.user.id;
    const user = await UserModel.findById(userId);

    // Only admin can access full analytics
    if (!user?.isAdmin) {
      // Return user-specific analytics
      const userOrders = await OrderModel.find({ user: userId });
      const userWishlist = await WishlistModel.find({ user: userId });

      const analytics = {
        userStats: {
          totalOrders: userOrders.length,
          totalSpent: userOrders.reduce((sum, order) => sum + order.totalPrice, 0),
          wishlistCount: userWishlist.length,
          pendingOrders: userOrders.filter(o => o.status === OrderStatus.NEW).length
        },
        recentOrders: userOrders.slice(-5).reverse()
      };

      res.send(analytics);
      return;
    }

    // Admin analytics
    const totalOrders = await OrderModel.countDocuments();
    const totalUsers = await UserModel.countDocuments();
    const totalFoods = await FoodModel.countDocuments();
    const totalWishlists = await WishlistModel.countDocuments();

    // Revenue calculations
    const allOrders = await OrderModel.find({ status: OrderStatus.PAYED });
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalPrice, 0);

    // Orders by status
    const ordersByStatus = await OrderModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Popular foods (most ordered)
    const popularFoods = await OrderModel.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.food',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    // Populate food details
    const popularFoodsWithDetails = await Promise.all(
      popularFoods.map(async (item) => {
        const food = await FoodModel.findById(item._id);
        return {
          food: food,
          totalQuantity: item.totalQuantity,
          totalRevenue: item.totalRevenue
        };
      })
    );

    // Recent orders
    const recentOrders = await OrderModel.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await OrderModel.aggregate([
      {
        $match: {
          status: OrderStatus.PAYED,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const analytics = {
      overview: {
        totalOrders,
        totalUsers,
        totalFoods,
        totalWishlists,
        totalRevenue
      },
      ordersByStatus,
      popularFoods: popularFoodsWithDetails,
      recentOrders,
      monthlyRevenue
    };

    res.send(analytics);
  }
));

export default router;

