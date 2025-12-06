const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/restaurantDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB locally!'))
.catch(err => console.error('❌ MongoDB connection error:', err));

const ReservationSchema = new mongoose.Schema({
    customerName: String,
    date: Date,
    guests: Number,
    hallPackage: String,
    totalAmount: Number,
    couponCode: String,
    orderItems: [{ id: Number, name: String, quantity: Number, price: Number, _id: false }],
    createdAt: { type: Date, default: Date.now }
});
const Reservation = mongoose.model('Reservation', ReservationSchema);

const CouponSchema = new mongoose.Schema({
    code: String,
    discountPercent: Number,
    isActive: Boolean
});
const Coupon = mongoose.model('Coupon', CouponSchema);

async function seedCoupons() {
    try {
        const count = await Coupon.countDocuments();
        if (count === 0) {
            await Coupon.create({ code: 'SAVE10', discountPercent: 10, isActive: true });
            await Coupon.create({ code: 'WELCOME20', discountPercent: 20, isActive: true });
            console.log('🎟️ Created test coupons: SAVE10 and WELCOME20');
        }
    } catch (error) { console.log('Error seeding coupons:', error); }
}
seedCoupons();

app.post('/api/reservations', async (req, res) => {
    try {
        console.log('Received Order:', req.body);
        const newReservation = new Reservation(req.body);
        await newReservation.save();
        res.status(201).json({ message: 'Reservation saved successfully!' });
    } catch (error) {
        console.error('Error saving:', error);
        res.status(500).json({ message: 'Failed to save reservation' });
    }
});

app.post('/api/coupons/validate', async (req, res) => {
    try {
        const { code } = req.body;
        console.log(`Checking coupon: ${code}`);
        const coupon = await Coupon.findOne({ code: code, isActive: true });
        if (coupon) {
            res.json({ success: true, discountPercent: coupon.discountPercent });
        } else {
            res.status(404).json({ success: false, message: 'Invalid code' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});