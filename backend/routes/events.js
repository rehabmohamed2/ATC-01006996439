const express = require('express');
const router = express.Router();
const multer = require('multer');
const { ObjectId } = require('mongodb');
const { connect, getEventCollection, getBucket } = require('../db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.use(async (req, res, next) => {
  try {
    console.log('Checking database connection...');
    const eventCollection = getEventCollection();
    const bucket = getBucket();
    if (!eventCollection || !bucket) {
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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching events with pagination');
    console.log('User making request:', req.user);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const eventCollection = getEventCollection();
    if (!eventCollection) {
      console.log('Event collection not initialized');
      throw new Error('Event collection not initialized');
    }

    const totalEvents = await eventCollection.countDocuments();
    const totalPages = Math.ceil(totalEvents / limit);

    if (totalEvents === 0) {
      console.log('No events found in database');
      return res.json({
        events: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalEvents: 0,
          limit
        }
      });
    }

    const events = await eventCollection
      .find()
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    console.log(`Found ${events.length} events for page ${page}`);
    res.json({
      events,
      pagination: {
        currentPage: page,
        totalPages,
        totalEvents,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    if (error.message === 'Event collection not initialized') {
      return res.status(500).json({ message: 'Database connection error' });
    }
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    console.log(`Fetching event with ID: ${req.params.id}`);
    const event = await getEventCollection().findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!event) {
      console.log('Event not found');
      return res.status(404).json({ message: 'Event not found' });
    }
    
    console.log('Event found:', event.name);
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    if (error.name === 'BSONTypeError') {
      return res.status(400).json({ message: 'Invalid event ID format' });
    }
    res.status(500).json({ message: 'Failed to fetch event' });
  }
});

router.get('/:id/image', async (req, res) => {
  try {
    const event = await getEventCollection().findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!event || !event.imageId) {
      return res.status(404).json({ message: 'Image not found' });
    }

    const downloadStream = getBucket().openDownloadStream(new ObjectId(event.imageId));
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ message: 'Failed to fetch image' });
  }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Creating new event:', req.body);
    
    if (req.user.role !== 'admin') {
      console.log('Non-admin user attempted to create event');
      return res.status(403).json({ message: 'Only admins can create events' });
    }

    const requiredFields = ['name', 'description', 'date', 'location', 'price', 'category'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: 'Missing required fields', 
        fields: missingFields 
      });
    }

    if (!req.file) {
      console.log('No image provided for new event');
      return res.status(400).json({ 
        message: 'Image is required for new events' 
      });
    }

    const bucket = getBucket();
    if (!bucket) {
      console.error('GridFS bucket not initialized');
      return res.status(500).json({ message: 'File storage not available' });
    }

    let imageId = null;
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype
    });
    
    uploadStream.write(req.file.buffer);
    uploadStream.end();

    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });

    imageId = uploadStream.id;

    const event = {
      ...req.body,
      imageId,
      bookings: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await getEventCollection().insertOne(event);
    const createdEvent = await getEventCollection().findOne({ _id: result.insertedId });
    
    console.log('Event created successfully:', createdEvent.name);
    res.status(201).json(createdEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    console.log(`Updating event with ID: ${req.params.id}`);
    console.log('Update data:', req.body);
    
    if (req.user.role !== 'admin') {
      console.log('Non-admin user attempted to update event');
      return res.status(403).json({ message: 'Only admins can update events' });
    }

    const eventId = new ObjectId(req.params.id);
    
    const existingEvent = await getEventCollection().findOne({ _id: eventId });
    if (!existingEvent) {
      console.log('Event not found for update');
      return res.status(404).json({ message: 'Event not found' });
    }

    const updateData = {
      name: req.body.name,
      description: req.body.description,
      date: req.body.date,
      location: req.body.location,
      price: Number(req.body.price),
      category: req.body.category,
      updatedAt: new Date()
    };

    if (req.file) {
      if (existingEvent.imageId) {
        await getBucket().delete(new ObjectId(existingEvent.imageId));
      }

      const uploadStream = getBucket().openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype
      });
      
      uploadStream.write(req.file.buffer);
      uploadStream.end();

      await new Promise((resolve, reject) => {
        uploadStream.on('finish', resolve);
        uploadStream.on('error', reject);
      });

      updateData.imageId = uploadStream.id;
    }

    console.log('Prepared update data:', updateData);

    await getEventCollection().updateOne(
      { _id: eventId },
      { $set: updateData }
    );

    const updatedEvent = await getEventCollection().findOne({ _id: eventId });
    
    if (!updatedEvent) {
      console.log('Failed to fetch updated event');
      return res.status(500).json({ message: 'Failed to update event' });
    }

    console.log('Event updated successfully:', updatedEvent.name);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to update event',
      error: error.message 
    });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    console.log(`Deleting event with ID: ${req.params.id}`);
    
    if (req.user.role !== 'admin') {
      console.log('Non-admin user attempted to delete event');
      return res.status(403).json({ message: 'Only admins can delete events' });
    }

    const eventId = new ObjectId(req.params.id);

    const existingEvent = await getEventCollection().findOne({ _id: eventId });
    if (!existingEvent) {
      console.log('Event not found for deletion');
      return res.status(404).json({ message: 'Event not found' });
    }

    if (existingEvent.imageId) {
      await getBucket().delete(new ObjectId(existingEvent.imageId));
    }

    const result = await getEventCollection().deleteOne({ _id: eventId });
    
    if (result.deletedCount === 0) {
      console.log('Failed to delete event');
      return res.status(500).json({ message: 'Failed to delete event' });
    }

    console.log('Event deleted successfully:', existingEvent.name);
    res.json({ 
      message: 'Event deleted successfully',
      deletedEvent: existingEvent
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to delete event',
      error: error.message 
    });
  }
});

module.exports = router; 