import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { BookingModel } from '../models/booking.model';

const router = Router();

// 1. GET Availability (For your Time Slots)
router.get('/:date', asyncHandler(async (req, res) => {
    const date = req.params.date;
    const bookings = await BookingModel.find({ date, status: { $ne: 'cancelled' } });
    const takenSlots = bookings.map(b => b.time);
    res.send(takenSlots);
}));

// 2. POST Create Booking (Saves all 3 types)
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { 
      name, email, phone, date, time, guests, type, 
      hallPackage, cartItems, totalPrice 
    } = req.body;

    const newBooking = {
      name,
      email,
      phone,
      date,
      time,
      guests,
      type,
      hallPackage, // Will be saved if sent (Option 3)
      cartItems,   // Will be saved if sent (Option 2)
      totalPrice,
      status: 'pending'
    };

    const dbBooking = await BookingModel.create(newBooking);
    res.send(dbBooking);
  })
);

export default router;