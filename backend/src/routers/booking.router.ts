import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { BookingModel } from '../models/booking.model';

const router = Router();

// GET Bookings by Date (to disable used slots)
router.get('/:date', asyncHandler(async (req, res) => {
    const date = req.params.date;
    // Find all bookings for this date that are NOT cancelled
    const bookings = await BookingModel.find({ date, status: { $ne: 'cancelled' } });
    
    // Return just the taken time slots
    const takenSlots = bookings.map(b => b.time);
    res.send(takenSlots);
}));

// ... Your existing POST route is here ...

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, phone, date, time, guests, type, hallPackage, cartItems } = req.body;

    const newBooking = {
      name,
      email,
      phone,
      date,
      time,
      guests,
      type,
      hallPackage,
      cartItems,
      status: 'pending'
    };

    const dbBooking = await BookingModel.create(newBooking);
    res.send(dbBooking);
  })
);

export default router;