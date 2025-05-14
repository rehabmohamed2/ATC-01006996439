const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables');
  process.exit(1);
}

let client;
let db;
let eventCollection;
let userCollection;
let eventBookingCollection;
let bucket;

async function initializeCollections() {
  try {
    if (!db) {
      throw new Error('Database not connected');
    }

    eventCollection = db.collection('events');
    userCollection = db.collection('users');
    bucket = new GridFSBucket(db);

    await eventCollection.createIndex({ date: 1 });
    await eventCollection.createIndex({ category: 1 });
    await userCollection.createIndex({ email: 1 }, { unique: true });

    console.log('Collections initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing collections:', error);
    return false;
  }
}

async function connect() {
  try {
    if (client) {
      console.log('Already connected to MongoDB Atlas');
      return db;
    }

    console.log('Connecting to MongoDB Atlas...');
    client = await MongoClient.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      retryReads: true,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    db = client.db();
    console.log('Connected to MongoDB Atlas');

    const collectionsInitialized = await initializeCollections();
    if (!collectionsInitialized) {
      throw new Error('Failed to initialize collections');
    }

    return db;
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error);
    throw error;
  }
}

async function disconnect() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    eventCollection = null;
    userCollection = null;
    eventBookingCollection = null;
    bucket = null;
    console.log('Disconnected from MongoDB Atlas');
  }
}

module.exports = {
  connect,
  disconnect,
  getEventCollection: () => eventCollection,
  getUserCollection: () => userCollection,
  getEventBookingCollection: () => eventBookingCollection,
  getBucket: () => bucket,
  eventCollection,
  userCollection,
  eventBookingCollection,
  bucket,
  ObjectId
}; 