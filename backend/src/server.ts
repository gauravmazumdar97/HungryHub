import dotenv from 'dotenv';
import path from 'path';
// Load environment variables first - specify the path explicitly
// The .env file is in the backend root directory
// Since server runs from src/ (cd src && nodemon), we need to go up one level
const envPath = path.resolve(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('Environment variables loaded from:', envPath);
  console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'NOT FOUND');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'NOT FOUND');
}

import express from "express";
import cors from "cors";
import foodRouter from "./routers/food.router"
import userRouter from "./routers/user.router"
import orderRouter from "./routers/order.router"
import wishlistRouter from "./routers/wishlist.router"
import analyticsRouter from "./routers/analytics.router"
import { dbConnect } from './configs/database.config';

dbConnect();

const app = express();
app.use(express.json());

app.use(cors({
    credentials: true,
    origin: true  // Allow all origins in development
}));

app.use("/api/foods", foodRouter);

// app.use("api/users/", userRouter);
app.use('/api/users', (req, _res, next) => {
    console.log(`[users] ${req.method} ${req.originalUrl}`);
    next();
  }, userRouter);

app.use('/api/orders', orderRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/analytics', analyticsRouter);
  
const port = 9000;
app.listen(port,()=>{
    console.log("Website served on http://localhost:"+ port);
})