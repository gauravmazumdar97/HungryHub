import {Router} from 'express';
import asyncHandler from 'express-async-handler';
import { HTTP_BAD_REQUEST } from '../constants/http_status';
import { OrderStatus } from '../constants/order_status';
import { OrderModel } from '../models/order.model';
import auth, { AuthRequest } from '../middlewares/auth.mid';
import crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Razorpay = require('razorpay');

const router = Router();
// TypeScript typing workaround for custom AuthRequest extension
router.use(auth as any);

router.post('/create',
asyncHandler(async (req: any, res) => {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    const requestOrder = req.body;

    if(requestOrder.items.length <= 0){
        res.status(HTTP_BAD_REQUEST).send('Cart Is Empty!');
        return;
    }

    await OrderModel.deleteOne({
        user: req.user.id,
        status: OrderStatus.NEW
    });

    const newOrder = new OrderModel({...requestOrder,user: req.user.id});
    await newOrder.save();
    res.send(newOrder);
})
)


router.get('/newOrderForCurrentUser', asyncHandler( async (req: any, res) => {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }
    const order= await getNewOrderForCurrentUser(req);
    if(order) res.send(order);
    else res.status(HTTP_BAD_REQUEST).send();
}))

router.post('/pay', asyncHandler( async (req: any, res) => {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }
    const {paymentId} = req.body;
    const order = await getNewOrderForCurrentUser(req);
    if(!order){
        res.status(HTTP_BAD_REQUEST).send('Order Not Found!');
        return;
    }

    order.paymentId = paymentId;
    order.status = OrderStatus.PAYED;
    await order.save();

    res.send(order._id);
}))

router.post('/create-razorpay-order', asyncHandler(async (req: any, res) => {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    const order = await getNewOrderForCurrentUser(req);
    if (!order) {
        res.status(HTTP_BAD_REQUEST).send('Order Not Found!');
        return;
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        res.status(500).send('Razorpay keys are not configured on the server.');
        return;
    }

    const razorpay = new Razorpay({
        key_id,
        key_secret
    });

    const options = {
        amount: Math.round(order.totalPrice * 100), // amount in paise
        currency: 'INR',
        receipt: order.id || order._id,
        notes: {
            orderId: order.id || order._id,
            userId: req.user.id
        }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.send({
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: key_id
    });
}));

router.post('/verify-razorpay-payment', asyncHandler(async (req: any, res) => {
    if (!req.user) {
        res.status(401).send('Unauthorized');
        return;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
        res.status(500).send('Razorpay secret is not configured on the server.');
        return;
    }

    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
        res.status(HTTP_BAD_REQUEST).send('Invalid payment signature');
        return;
    }

    const order = await getNewOrderForCurrentUser(req);
    if (!order) {
        res.status(HTTP_BAD_REQUEST).send('Order Not Found!');
        return;
    }

    order.paymentId = razorpay_payment_id;
    order.status = OrderStatus.PAYED;
    await order.save();

    res.send(order._id);
}))

router.get('/track/:id', asyncHandler( async (req, res) => {
    const order = await OrderModel.findById(req.params.id);
    res.send(order);
}))

export default router;

async function getNewOrderForCurrentUser(req: any) {
    if (!req.user) {
        return null;
    }
    return await OrderModel.findOne({ user: req.user.id, status: OrderStatus.NEW });
}