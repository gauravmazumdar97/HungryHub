import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { FoodModel } from '../models/food.model';
import auth from '../middlewares/auth.mid'; // uses your existing auth

const router = Router();

/**
 * PUBLIC: Seed endpoint
 * Keep this first so you can seed without auth if needed.
 */
router.get(
  '/seed',
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const count = await FoodModel.countDocuments();
    if (count > 0) {
      res.status(200).json({ message: 'Already seeded', count });
      return;
    }

    // Minimal example data – adjust to your real seed if you have one
    const sampleFoods = [
      {
        name: 'Margherita Pizza',
        price: 9.99,
        imageUrl: 'https://example.com/pizza.jpg',
        origins: ['Italian'],
        cookTime: '20-30',
        stock: 100,
      },
      {
        name: 'Classic Burger',
        price: 8.49,
        imageUrl: 'https://example.com/burger.jpg',
        origins: ['American'],
        cookTime: '10-15',
        stock: 100,
      },
    ];

    await FoodModel.insertMany(sampleFoods);
    res.status(201).json({ message: 'Seeded', count: sampleFoods.length });
  })
);

/**
 * PROTECTED: Everything below requires a valid JWT
 * If you want the catalog public, remove router.use(auth) and add auth per-route as needed.
 */
router.use(auth as any);

/** GET /api/foods */
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const foods = await FoodModel.find();
    res.json(foods);
  })
);

/** GET /api/foods/search/:term */
router.get(
  '/search/:term',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const term = req.params.term;
    const regex = new RegExp(term, 'i');
    const foods = await FoodModel.find({ name: { $regex: regex } });
    res.json(foods);
  })
);

/** GET /api/foods/tags
 * Returns: [{ name: 'All', count: number }, { name: 'Italian', count: number }, ...]
 */
router.get(
  '/tags',
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const tags = await FoodModel.aggregate([
      { $unwind: '$origins' },
      {
        $group: {
          _id: '$origins',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    const allFoodsCount = await FoodModel.countDocuments();
    tags.unshift({ name: 'All', count: allFoodsCount });

    res.json(tags);
  })
);

/** GET /api/foods/tag/:tag */
router.get(
  '/tag/:tag',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const tag = req.params.tag;
    const foods = await FoodModel.find({ origins: tag });
    res.json(foods);
  })
);

/** GET /api/foods/:foodId */
router.get(
  '/:foodId',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const food = await FoodModel.findById(req.params.foodId);
    if (!food) {
      res.status(404).json({ message: 'Food not found' });
      return;
    }
    res.json(food);
  })
);

/** PUT /api/foods/:foodId  (Admin-only ideally)
 *  Updates price and/or stock. Add an `isAdmin` middleware if you have one.
 */
router.put(
  '/:foodId',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { price, stock } = req.body;
    const update: any = {};
    if (price !== undefined) update.price = price;
    if (stock !== undefined) update.stock = stock;

    const updated = await FoodModel.findByIdAndUpdate(
      req.params.foodId,
      { $set: update },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ message: 'Food not found' });
      return;
    }

    res.json(updated);
  })
);

export default router;
