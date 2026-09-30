

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// ============================================================
// JWT TOKEN
// ============================================================

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in .env');
  }

  return jwt.sign(
    { userId },
    secret,
    {
      expiresIn: '7d',
    }
  );
};

// ============================================================
// SIGNUP
// ============================================================

export const signup = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
      rememberMe,
    } = req.body;

    // --------------------------------------------------------
    // Required fields
    // --------------------------------------------------------

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword
    ) {
      res.status(400).json({
        success: false,
        message: 'Please fill all required fields',
      });

      return;
    }

    // --------------------------------------------------------
    // Password match
    // --------------------------------------------------------

    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });

      return;
    }

    // --------------------------------------------------------
    // Password length
    // --------------------------------------------------------

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });

      return;
    }

    // --------------------------------------------------------
    // Check existing email
    // --------------------------------------------------------

    const existingEmail = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      res.status(409).json({
        success: false,
        message: 'Email already registered',
      });

      return;
    }

    // --------------------------------------------------------
    // Check existing phone
    // --------------------------------------------------------

    const existingPhone = await User.findOne({
      phone,
    });

    if (existingPhone) {
      res.status(409).json({
        success: false,
        message: 'Phone number already registered',
      });

      return;
    }

    // --------------------------------------------------------
    // Create user
    // Password hashing User model ke pre-save hook me hoga
    // --------------------------------------------------------

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      rememberMe: Boolean(rememberMe),
      role: 'user',
      isActive: true,
    });

    // --------------------------------------------------------
    // Generate JWT
    // --------------------------------------------------------

    const token = generateToken(user._id.toString());

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    res.status(201).json({
      success: true,
      message: 'Account created successfully',

      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        rememberMe: user.rememberMe,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },

      token,
    });
  } catch (error) {
    console.error('Signup Error:', error);

    res.status(500).json({
      success: false,
      message: 'Something went wrong during signup',
    });
  }
};

// ============================================================
// LOGIN
// ============================================================

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      email,
      password,
      rememberMe,
    } = req.body;

    // --------------------------------------------------------
    // Validation
    // --------------------------------------------------------

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });

      return;
    }

    // --------------------------------------------------------
    // Find user
    // Password select:false hai, isliye explicitly select karna
    // --------------------------------------------------------

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });

      return;
    }

    // --------------------------------------------------------
    // Check account status
    // --------------------------------------------------------

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Your account has been deactivated',
      });

      return;
    }

    // --------------------------------------------------------
    // Compare password
    // --------------------------------------------------------

    const isPasswordValid =
      await user.comparePassword(password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });

      return;
    }

    // --------------------------------------------------------
    // Update Remember Me
    // --------------------------------------------------------

    if (typeof rememberMe === 'boolean') {
      user.rememberMe = rememberMe;
      await user.save();
    }

    // --------------------------------------------------------
    // Generate JWT
    // --------------------------------------------------------

    const token = generateToken(user._id.toString());

    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    res.status(200).json({
      success: true,
      message: 'Login successful',

      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        rememberMe: user.rememberMe,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },

      token,
    });
  } catch (error) {
    console.error('Login Error:', error);

    res.status(500).json({
      success: false,
      message: 'Something went wrong during login',
    });
  }
};

// ============================================================
// GET CURRENT USER
// ============================================================

export const getMe = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // authMiddleware userId attach karega
    const userId = (req as Request & {
      userId?: string;
    }).userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });

      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });

      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        rememberMe: user.rememberMe,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get Me Error:', error);

    res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
};