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
const envPath = path.resolve(__dirname, '..', '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn('⚠️  .env file not found. Using system env variables.');
} else {
  console.log('✅ Environment variables loaded.');
}

// 2. Connect to Database
dbConnect();

const app = express();

// --- MIDDLEWARE (Order is Critical!) ---

// 1. JSON Parser
app.use(express.json());

// 2. CORS (MUST be before routes)
app.use(cors({
    credentials: true,
    origin: ["http://localhost:4200", "http://localhost:3000", "http://localhost:4201"]
}));


// --- ROUTES ---
// Now valid because CORS is already set up above
app.use('/api/bookings', bookingRouter); 
app.use("/api/foods", foodRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/analytics", dashboardRouter);


// 4. GLOBAL ERROR HANDLER
app.use((err: any, req: any, res: any, next: any) => {
    console.error(`[Error] ${req.method} ${req.url}:`, err.stack);
    const status = err.status || 500;
    const message = err.message || "Something went wrong on the server";
    res.status(status).send({ message });
});

// --- SERVER START ---
const port = process.env.PORT || 9000;
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});