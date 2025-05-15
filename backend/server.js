const express = require('express');
const cors = require('cors');
const { connect } = require('./db');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const eventBookingRoutes = require('./routes/eventBooking');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'https://atc-01006996439.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(express.json());

connect().catch(console.error);

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', eventBookingRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 