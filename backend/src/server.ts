import dotenv from 'dotenv';
import path from 'path';
import express from "express";
import cors from "cors";
import { dbConnect } from './configs/database.config';

// --- ROUTER IMPORTS ---
import foodRouter from "./routers/food.router";
import userRouter from "./routers/user.router";
import orderRouter from "./routers/order.router";
import wishlistRouter from "./routers/wishlist.router";
import dashboardRouter from './routers/dashboard.router';
import bookingRouter from './routers/booking.router';

// --- CONFIGURATION ---
// 1. Load Environment Variables
const envPath = path.resolve(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn('⚠️  .env file not found or could not be loaded. Using system env variables.');
} else {
  console.log('✅ Environment variables loaded.');
  console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'NOT FOUND');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'NOT FOUND');
}

// 2. Connect to Database
dbConnect();

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use('/api/bookings', bookingRouter);

// 3. CORS: Allow frontend origins
app.use(cors({
    credentials: true,
    origin: ["http://localhost:4200", "http://localhost:3000", "http://localhost:4201"]
}));

// --- ROUTES ---
app.use("/api/foods", foodRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/analytics", dashboardRouter);

// 4. GLOBAL ERROR HANDLER (Crucial for express-async-handler)
// This catches any error thrown in your routers and sends a JSON response
app.use((err: any, req: any, res: any, next: any) => {
    console.error(`[Error] ${req.method} ${req.url}:`, err.stack);
    
    // Default to 500 Server Error if status not set
    const status = err.status || 500;
    const message = err.message || "Something went wrong on the server";

    res.status(status).send({ message });
});

// --- SERVER START ---
const port = process.env.PORT || 7000;
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
