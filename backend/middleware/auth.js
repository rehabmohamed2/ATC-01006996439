const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getUserCollection } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded:', decoded);

    if (!decoded.userId) {
      console.log('Token does not contain userId');
      return res.status(401).json({ message: 'Invalid token format' });
    }

    const userCollection = getUserCollection();
    if (!userCollection) {
      console.log('User collection not initialized');
      return res.status(500).json({ message: 'Database error' });
    }

    const user = await userCollection.findOne({ 
      _id: new ObjectId(decoded.userId) 
    });

    console.log('User found:', user ? {
      id: user._id,
      email: user.email,
      role: user.role
    } : 'No user found');

    if (!user) {
      console.log('User not found in database');
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role || 'user'
    };

    console.log('Authentication successful for user:', req.user);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Authentication error' });
  }
};

module.exports = auth; 