const express = require('express');
const { connect, getEventBookingCollection, getEventCollection, ObjectId } = require('../db');
const router = express.Router();

router.use(async (req, res, next) => {
  try {
    const eventBookingCollection = getEventBookingCollection();
    if (!eventBookingCollection) {
      await connect();
    }
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection error' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const eventBookingCollection = getEventBookingCollection();
    
    const bookings = await eventBookingCollection
      .find({ userId: new ObjectId(userId) })
      .toArray();

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const eventBookingCollection = getEventBookingCollection();
    
    const bookings = await eventBookingCollection
      .find({ eventId: new ObjectId(eventId) })
      .toArray();

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching event bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { eventId, userId, numberOfTickets, bookingDate } = req.body;
    const eventBookingCollection = getEventBookingCollection();
    const eventCollection = getEventCollection();

    const event = await eventCollection.findOne({ _id: new ObjectId(eventId) });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const booking = {
      eventId: new ObjectId(eventId),
      userId: new ObjectId(userId),
      numberOfTickets,
      bookingDate: new Date(bookingDate),
      status: 'confirmed',
      createdAt: new Date()
    };

    const result = await eventBookingCollection.insertOne(booking);
    res.status(201).json({
      message: 'Booking created successfully',
      booking: { ...booking, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

router.patch('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    const eventBookingCollection = getEventBookingCollection();

    const result = await eventBookingCollection.updateOne(
      { _id: new ObjectId(bookingId) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking updated successfully' });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Error updating booking' });
  }
});

router.delete('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const eventBookingCollection = getEventBookingCollection();

    const result = await eventBookingCollection.deleteOne({
      _id: new ObjectId(bookingId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Error deleting booking' });
  }
});

module.exports = router; 