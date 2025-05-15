const express = require('express');
const cors = require('cors');
const path = require('path');
const { connect } = require('./db');
require('dotenv').config();
const eventsRouter = require('./routes/events');
const authRouter = require('./routes/auth');
const bookingsRouter = require('./routes/bookings');

const app = express();

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://events-booking-system-m132.vercel.app/', 'https://events-booking-system.vercel.app'] 
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
  const fs = require('fs');
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  
  const uploadsDir = path.join(__dirname, 'uploads', 'events');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

connect().then(() => {
  console.log('Database connection established');
}).catch(err => {
  console.error('Database connection failed:', err);
});

// Routes
app.use('/api/events', eventsRouter);
app.use('/api/auth', authRouter);
app.use('/api/bookings', bookingsRouter);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app; 