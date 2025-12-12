import { Router } from 'express';
import { sample_users } from '../data';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { User, UserModel } from '../models/user.model';
import { HTTP_BAD_REQUEST } from '../constants/http_status';
import bcrypt from 'bcryptjs';
import auth from '../middlewares/auth.mid';

const router = Router();
const PASSWORD_HASH_SALT_ROUNDS = 10;

// 1. SEED ROUTE (Fixed: Hashes passwords before saving)
router.get("/seed", asyncHandler(
  async (req, res) => {
    const usersCount = await UserModel.countDocuments();
    if (usersCount > 0) {
      res.send("Seed is already done!");
      return;
    }

    // Hash passwords so they work with the login logic
    const usersWithHashedPasswords = await Promise.all(sample_users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, PASSWORD_HASH_SALT_ROUNDS);
      return { ...user, password: hashedPassword, email: user.email.toLowerCase() };
    }));

    await UserModel.create(usersWithHashedPasswords);
    res.send("Seed Is Done!");
  }
));

// 2. LOGIN ROUTE (Fixed: Normalizes email to lowercase)
router.post("/login", asyncHandler(
  async (req, res) => {
    const { email, password } = req.body;
    
    // Convert input to lowercase to match registration
    const user = await UserModel.findOne({ email: email.toLowerCase() });
  
    if (user && (await bcrypt.compare(password, user.password))) {
      res.send(generateTokenReponse(user));
    } else {
      res.status(HTTP_BAD_REQUEST).send("Username or password is invalid!");
    }
  }
));
  
router.post('/register', asyncHandler(
  async (req, res) => {
    const { name, email, password, address } = req.body;
    const user = await UserModel.findOne({ email: email.toLowerCase() }); // Ensure check matches lowercase
    if (user) {
      res.status(HTTP_BAD_REQUEST)
        .send('User is already exist, please login!');
      return;
    }

    const encryptedPassword = await bcrypt.hash(password, PASSWORD_HASH_SALT_ROUNDS);

    const newUser = {
      name,
      email: email.toLowerCase(),
      password: encryptedPassword,
      address,
      isAdmin: false
    }

    const dbUser = await UserModel.create(newUser);
    res.send(generateTokenReponse(dbUser));
  }
));

const generateTokenReponse = (user: any) => {
  const userId = user._id ? user._id.toString() : user.id;
  const JWT_SECRET = process.env.JWT_SECRET;
  
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables. Please create a .env file in the backend folder with JWT_SECRET=your_secret_key');
  }
  
  const token = jwt.sign({
    id: userId, email: user.email, isAdmin: user.isAdmin
  }, JWT_SECRET, {
    expiresIn: "30d"
  });

  return {
    id: userId,
    email: user.email,
    name: user.name,
    address: user.address,
    isAdmin: user.isAdmin,
    token: token
  };
}

// GET ALL USERS (Admin only - excludes logged-in user)
router.get('/all', auth as any, asyncHandler(
  async (req: any, res) => {
    if (!req.user) {
      res.status(401).send('Unauthorized');
      return;
    }

    const currentUser = await UserModel.findById(req.user.id);
    if (!currentUser?.isAdmin) {
      res.status(403).send('Admin access required');
      return;
    }

    // Get all users except the logged-in user
    const users = await UserModel.find({ _id: { $ne: req.user.id } })
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 }); // Sort by newest first

    res.json(users);
  }
));

export default router;
