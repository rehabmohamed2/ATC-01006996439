const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connect, getUserCollection } = require('../db');
const router = express.Router();
const { ObjectId } = require('mongodb');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.use(async (req, res, next) => {
  try {
    console.log('Checking database connection...');
    const userCollection = getUserCollection();
    if (!userCollection) {
      console.log('Database connection not initialized, connecting...');
      await connect();
      console.log('Database connection established');
    }
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection error' });
  }
});

router.post('/register', async (req, res) => {
  const startTime = Date.now();
  try {
    const { username, email, password } = req.body;
    console.log('Registration attempt for email:', email);
    console.log('Time elapsed before DB query:', Date.now() - startTime, 'ms');

    const userCollection = getUserCollection();
    if (!userCollection) {
      throw new Error('User collection not initialized');
    }

    const existingUser = await userCollection.findOne({ email });
    console.log('Time elapsed after DB query:', Date.now() - startTime, 'ms');
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await userCollection.insertOne({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date()
    });

    const token = jwt.sign(
      { userId: result.insertedId, role: 'user' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertedId,
        username,
        email,
        role: 'user'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Time elapsed before error:', Date.now() - startTime, 'ms');
    res.status(500).json({ message: 'Error registering user' });
  }
});

router.post('/login', async (req, res) => {
  const startTime = Date.now();
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);
    console.log('Time elapsed before DB query:', Date.now() - startTime, 'ms');

    const userCollection = getUserCollection();
    if (!userCollection) {
      console.log('User collection not initialized, attempting to connect...');
      await connect();
      console.log('Connection established, retrying login...');
    }

    const user = await userCollection.findOne({ email });
    console.log('Time elapsed after DB query:', Date.now() - startTime, 'ms');
    console.log('User found:', user ? {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      hasPassword: !!user.password
    } : 'No');

    if (!user) {
      console.log('User not found in database');
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Time elapsed after password comparison:', Date.now() - startTime, 'ms');
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    console.log('Time elapsed after token creation:', Date.now() - startTime, 'ms');

    console.log('Login successful, sending response with user role:', user.role);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role || 'user' // Ensure role is always set
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Time elapsed before error:', Date.now() - startTime, 'ms');
    res.status(500).json({ 
      success: false,
      message: 'Error logging in' 
    });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('Fetching user profile for user:', req.user);
    const userCollection = getUserCollection();
    if (!userCollection) {
      throw new Error('User collection not initialized');
    }

    // Get user from database using the ID from the token
    const user = await userCollection.findOne({ 
      _id: new ObjectId(req.user.userId) 
    });

    console.log('User found:', user ? {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role
    } : 'No user found');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data without sensitive information
    res.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role || 'user' // Ensure role is always set
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

module.exports = router; 