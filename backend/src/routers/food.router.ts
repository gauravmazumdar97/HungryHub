import {Router} from 'express';
import { sample_foods } from '../data'; // Assuming you use this for seeding
import asyncHandler from 'express-async-handler';
import { FoodModel } from '../models/food.model';
// NOTE: Make sure you have implemented the 'inventory_quantity' field in FoodModel!
const router = Router();

// --- 1. SEED ROUTE ---
router.get("/seed", asyncHandler(
 async (req, res) => {
    const foodsCount = await FoodModel.countDocuments();
    if(foodsCount > 0){
      res.send("Seed is already done!");
      return;
    }

    await FoodModel.create(sample_foods);
    res.send("Seed Is Done!");
}
))

// --- 2. GET ALL FOODS ROUTE ---
router.get("/",asyncHandler(
  async (req, res) => {
    const foods = await FoodModel.find();
      res.send(foods);
  }
))

// --- 3. SEARCH FOODS ROUTE ---
router.get("/search/:searchTerm", asyncHandler(
  async (req, res) => {
    const searchRegex = new RegExp(req.params.searchTerm, 'i');
    const foods = await FoodModel.find({name: {$regex:searchRegex}})
    res.send(foods);
  }
))

// --- 4. GET TAGS ROUTE (for filtering) ---
router.get("/tags", asyncHandler(
  async (req, res) => {
    const tags = await FoodModel.aggregate([
      {
        $unwind:'$tags'
      },
      {
        $group:{
          _id: '$tags',
          count: {$sum: 1}
        }
      },
      {
        $project:{
          _id: 0,
          name:'$_id',
          count: '$count'
        }
      }
    ]).sort({count: -1});

    const all = {
      name : 'All',
      count: await FoodModel.countDocuments()
    }

    tags.unshift(all);
    res.send(tags);
  }
))

// --- 5. GET FOODS BY TAG NAME ROUTE ---
router.get("/tag/:tagName",asyncHandler(
  async (req, res) => {
    const foods = await FoodModel.find({tags: req.params.tagName})
    res.send(foods);
  }
))

// --- 6. GET FOOD BY ID ROUTE ---
router.get("/:foodId", asyncHandler(
  async (req, res) => {
    const food = await FoodModel.findById(req.params.foodId);
    res.send(food);
  }
))

// ----------------------------------------------------------------------
// 🔑 7. NEW: INVENTORY MANAGEMENT API (PUT method for updates)
// URL: PUT /api/foods/inventory/:foodId
// ----------------------------------------------------------------------
router.put(
    '/inventory/:foodId',
    // In a real app, always add Admin Authorization middleware here!
    asyncHandler(async (req, res) => {
        const { foodId } = req.params;
        const { newQuantity } = req.body; 

        // 1. Validation
        if (typeof newQuantity !== 'number' || newQuantity < 0) {
            res.status(400).send({ message: 'Invalid quantity. Must be a non-negative number.' });
            return;
        }

        // 2. Find and Update the Food Item
        const updatedFood = await FoodModel.findByIdAndUpdate(
            foodId,
            { inventory_quantity: newQuantity },
            { new: true, runValidators: true } 
        );

        if (!updatedFood) {
            res.status(404).send({ message: 'Food item not found.' });
            return;
        }

        // 3. Success Response
        res.send(updatedFood);
    })
);


export default router;
