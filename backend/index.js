const express = require('express');
const cors = require('cors');
const path = require('path');
const { connect } = require('./db');
require('dotenv').config();
const fs = require('fs');
const eventsRouter = require('./routes/events');
const authRouter = require('./routes/auth');
const bookingsRouter = require('./routes/bookings');

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadsDir = path.join(__dirname, 'uploads', 'events');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function startServer() {
  try {
    await connect();
    console.log('Database connection established');

    app.use('/api/events', eventsRouter);
    app.use('/api/auth', authRouter);
    app.use('/api/bookings', bookingsRouter);

    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ message: 'Something went wrong!' });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 