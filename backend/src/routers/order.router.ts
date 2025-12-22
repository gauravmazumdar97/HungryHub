import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { Types } from 'mongoose';
import { HTTP_BAD_REQUEST } from '../constants/http_status';
import { OrderStatus } from '../constants/order_status';
import { OrderModel } from '../models/order.model';
import { FoodModel } from '../models/food.model';
import auth from '../middlewares/auth.mid';
import crypto from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Razorpay = require('razorpay');

const router = Router();
router.use(auth as any);

// 1. CREATE ORDER (With Stock Validation & Deduction)
router.post('/create', asyncHandler(async (req: any, res) => {
  const { items, name, address, totalPrice, addressLatLng } = req.body;

  if (!req.user) {
    res.status(401).send('Unauthorized');
    return;
  }

  if (!items || items.length <= 0) {
    res.status(HTTP_BAD_REQUEST).send('Cart Is Empty!');
    return;
  }

  // Debug: Log first item structure (remove in production)
  if (items.length > 0) {
    console.log('First item structure:', JSON.stringify(items[0], null, 2));
  }

  // --- STEP 1: CHECK STOCK ---
  for (const item of items) {
    const foodId = item.food.id || item.food;
    const food = await FoodModel.findById(foodId);

    if (!food) {
      res.status(HTTP_BAD_REQUEST).send('Item not found!');
      return;
    }

    if (food.stock < item.quantity) {
      res
        .status(HTTP_BAD_REQUEST)
        .send(`Not enough stock for ${food.name}. Only ${food.stock} left.`);
      return;
    }
  }

  // --- STEP 2: CREATE ORDER ---
  await OrderModel.deleteOne({
    user: req.user.id,
    status: OrderStatus.NEW
  });

  // Transform items to only include food ObjectId (not full food object)
  const transformedItems = items.map((item: any) => {
    // Extract food ID - handle both object with id property and direct ID
    let foodId = item.food;
    if (item.food && typeof item.food === 'object' && !(item.food instanceof Types.ObjectId)) {
      // If it's an object, extract the ID
      foodId = item.food.id || item.food._id;
    }
    
    // Convert to ObjectId if it's a string
    let foodObjectId: Types.ObjectId;
    if (foodId instanceof Types.ObjectId) {
      foodObjectId = foodId;
    } else if (typeof foodId === 'string') {
      // Validate that it's a valid ObjectId string
      if (Types.ObjectId.isValid(foodId)) {
        foodObjectId = new Types.ObjectId(foodId);
      } else {
        throw new Error(`Invalid food ID format: ${foodId}`);
      }
    } else {
      throw new Error(`Unexpected food ID type: ${typeof foodId}`);
    }
    
    return {
      food: foodObjectId,
      price: Number(item.price),
      quantity: Number(item.quantity)
    };
  });

  // Debug: Log transformed items (first item only)
  if (transformedItems.length > 0) {
    console.log('Transformed first item:', {
      food: transformedItems[0].food.toString(),
      price: transformedItems[0].price,
      quantity: transformedItems[0].quantity
    });
  }

  // Create order with transformed items
  const orderData = {
    items: transformedItems,
    name,
    totalPrice,
    address,
    addressLatLng: addressLatLng || { lat: 0, lng: 0 },
    user: new Types.ObjectId(req.user.id),
    status: OrderStatus.NEW
  };

  const newOrder = new OrderModel(orderData);

  try {
  await newOrder.save();
  } catch (error: any) {
    console.error('Order save error:', error);
    console.error('Order data:', JSON.stringify(orderData, null, 2));
    throw error;
  }

  // --- STEP 3: DEDUCT STOCK (only after order is created successfully) ---
  // Note: Stock is deducted when order is created, not when payment is made
  // This prevents overselling. If payment fails, stock can be restored manually.
  for (const item of items) {
    const foodId = item.food.id || item.food;
    const food = await FoodModel.findById(foodId);
    if (food) {
      food.stock -= item.quantity;
      await food.save();
    }
  }

  res.send(newOrder);
}));

// current in-progress order (status NEW)
router.get('/newOrderForCurrentUser', asyncHandler(async (req: any, res) => {
  if (!req.user) {
    res.status(401).send('Unauthorized');
    return;
  }
  
  const order = await getNewOrderForCurrentUser(req);
  if (order) {
    res.send(order);
  } else {
    // Check if user has any orders (for debugging)
    const anyOrder = await OrderModel.findOne({ user: req.user.id });
    console.log('No NEW order found. User has any order:', anyOrder ? `Yes, status: ${anyOrder.status}` : 'No orders at all');
    res.status(404).send({ message: 'No active (NEW) order found' });
  }
}));

// ✅ NEW: all orders for current user (order history)
router.get('/myOrders', asyncHandler(async (req: any, res) => {
  if (!req.user) {
    res.status(401).send('Unauthorized');
    return;
  }

  const orders = await OrderModel
    .find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.send(orders);
}));

// --- RAZORPAY PAYMENT ENDPOINTS ---
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
}));

// --- DUMMY PAYMENT ENDPOINT (fallback) ---
router.post('/pay', asyncHandler(async (req: any, res) => {
  const order = await getNewOrderForCurrentUser(req);

  if (!order) {
    res.status(HTTP_BAD_REQUEST).send('Order Not Found!');
    return;
  }

  order.paymentId = req.body.paymentId || `DUMMY_PAY_${Date.now()}`;
  order.status = OrderStatus.PAYED;
  await order.save();

  res.send(order._id);
}));

// --- REPORTS & INVOICE GENERATION ---

// 1. INVOICE GENERATOR
router.get('/invoice/:id', asyncHandler(async (req: any, res) => {
  const order = await OrderModel.findOne({ _id: req.params.id, user: req.user.id })
    .populate('user', 'name email')
    .populate('items.food');

  if (!order) {
    res.status(HTTP_BAD_REQUEST).send('Order not found');
    return;
  }

  const invoiceHtml = `
    <html>
    <head>
        <style>
            body { font-family: Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #ffbb00; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #e67e22; }
            .details { margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 10px; background: #f9f9f9; border-bottom: 1px solid #ddd; }
            td { padding: 10px; border-bottom: 1px solid #eee; }
            .total { font-size: 20px; font-weight: bold; text-align: right; margin-top: 30px; }
            .status { font-weight: bold; color: green; }
        </style>
    </head>
    <body>
        <div class="header">
            <div>
                <div class="title">HungryHub Invoice</div>
                <p>Order ID: ${order.id}</p>
                <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div style="text-align: right;">
                <p><strong>Status:</strong> <span class="status">${order.status}</span></p>
                <p>Payment ID: ${order.paymentId || 'N/A'}</p>
            </div>
        </div>

        <div class="details">
            <h3>Bill To:</h3>
            <p><strong>${order.name}</strong></p>
            <p>${order.address}</p>
            <p>${(order.user as any).email}</p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map(item => `
                    <tr>
                        <td>${(item.food as any).name}</td>
                        <td>$${item.price.toFixed(2)}</td>
                        <td>${item.quantity}</td>
                        <td>$${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="total">
            Grand Total: $${order.totalPrice.toFixed(2)}
        </div>
        
        <script>
            window.onload = function() { window.print(); }
        </script>
    </body>
    </html>
  `;

  res.send(invoiceHtml);
}));

// 2. SALES REPORT
router.get('/reports/sales', asyncHandler(async (req: any, res) => {
  const salesData = await OrderModel.aggregate([
    { $match: { status: OrderStatus.PAYED } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        dailyRevenue: { $sum: '$totalPrice' },
        totalOrders: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);
  res.send(salesData);
}));

// 3. POPULAR ITEMS REPORT
router.get('/reports/popular', asyncHandler(async (req: any, res) => {
  const popularItems = await OrderModel.aggregate([
    { $match: { status: OrderStatus.PAYED } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.food',
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'foods',
        localField: '_id',
        foreignField: '_id',
        as: 'foodDetails'
      }
    },
    { $unwind: '$foodDetails' },
    {
      $project: {
        name: '$foodDetails.name',
        image: '$foodDetails.imageUrl',
        totalSold: 1,
        revenue: 1
      }
    }
  ]);
  res.send(popularItems);
}));

router.get('/track/:id', asyncHandler(async (req: any, res) => {
  const order = await OrderModel.findOne({
    _id: req.params.id,
    user: req.user.id
  });

  if (!order) {
    res.status(HTTP_BAD_REQUEST).send('Order not found or unauthorized');
    return;
  }

  res.send(order);
}));

export default router;

async function getNewOrderForCurrentUser(req: any) {
  if (!req.user) return null;
  // Mongoose automatically converts string IDs to ObjectId in queries
  const order = await OrderModel.findOne({ 
    user: req.user.id, 
    status: OrderStatus.PAYED 
  }).populate('items.food');
  
  return order;
}
