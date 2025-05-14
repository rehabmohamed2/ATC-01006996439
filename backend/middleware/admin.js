const jwt = require('jsonwebtoken');
const { userCollection } = require('../db');

const admin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const user = await userCollection.findOne({ 
      _id: decoded.userId,
      role: 'admin'
    });

    if (!user) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

module.exports = admin; 