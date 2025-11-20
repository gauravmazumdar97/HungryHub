import dotenv from 'dotenv';
dotenv.config();


import express from "express";
import cors from "cors";
import foodRouter from "./routers/food.router"
import userRouter from "./routers/user.router"
import { dbConnect } from './configs/database.config';

dbConnect();

const app = express();
app.use(express.json());

app.use(cors({
    credentials:false,
    origin:["*"]
}));

app.use("/api/foods", foodRouter);

// app.use("api/users/", userRouter);
app.use('/api/users', (req, _res, next) => {
    console.log(`[users] ${req.method} ${req.originalUrl}`);
    next();
  }, userRouter);
  
const port = 9000;
app.listen(port,()=>{
    console.log("Website served on http://localhost:"+ port);
})