const express = require('express');
const { ObjectId } = require('mongodb');
const auth = require('../middleware/auth');
const router = express.Router();
const { connect, client } = require('../config/database');

let bookingCollection;
let eventCollection;

async function initialize() {
  try {
    const db = await connect();
    bookingCollection = db.collection('bookings');
    eventCollection = db.collection('events');
    console.log('Collections initialized successfully');
  } catch (error) {
    console.error('Error initializing collections:', error);
  }
}

initialize();

router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating booking with data:', req.body);
    console.log('User from token:', req.user);
    
    const { eventId } = req.body;
    
    if (!eventId) {
      console.log('No eventId provided in request');
      return res.status(400).json({ message: 'Event ID is required' });
    }

    if (!req.user || !req.user.userId) {
      console.log('No user ID in token');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('Checking event:', eventId);
    const event = await eventCollection.findOne({ _id: new ObjectId(eventId) });
    if (!event) {
      console.log('Event not found:', eventId);
      return res.status(404).json({ message: 'Event not found' });
    }
    console.log('Event found:', event.title);

    if (event.availableSpots <= 0) {
      console.log('No spots available for event:', eventId);
      return res.status(400).json({ message: 'No spots available for this event' });
    }

    console.log('Checking for existing booking');
    const existingBooking = await bookingCollection.findOne({
      userId: new ObjectId(req.user.userId),
      eventId: new ObjectId(eventId)
    });

    if (existingBooking) {
      console.log('User already booked this event');
      return res.status(400).json({ message: 'You have already booked this event' });
    }

    const booking = {
      userId: new ObjectId(req.user.userId),
      eventId: new ObjectId(eventId),
      status: 'confirmed',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Creating booking:', booking);

    let result;
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        result = await bookingCollection.insertOne(booking, { session });
        console.log('Booking created:', result);
        
        const updateResult = await eventCollection.updateOne(
          { _id: new ObjectId(eventId) },
          { $set: { availableSpots: Number(event.availableSpots) - 1 } },
          { session }
        );
        console.log('Event spots updated:', updateResult);
      });
    } catch (transactionError) {
      console.error('Transaction failed:', transactionError);
      throw transactionError;
    } finally {
      await session.endSession();
    }

    const createdBooking = await bookingCollection.findOne({ _id: result.insertedId });
    console.log('Booking created successfully:', createdBooking);
    res.status(201).json(createdBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to create booking',
      error: error.message 
    });
  }
});

router.get('/my-bookings', auth, async (req, res) => {
  try {
    console.log('Fetching bookings for user:', req.user.userId);
    const bookings = await bookingCollection
      .find({ userId: new ObjectId(req.user.userId) })
      .toArray();
    console.log('Found bookings:', bookings);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

module.exports = router; 