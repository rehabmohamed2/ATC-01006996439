const { MongoClient } = require('mongodb');
require('dotenv').config();

// Connection URL
const url = process.env.MONGO_URI;
if (!url) {
  console.error('MONGO_URI is not defined in environment variables');
  process.exit(1);
}

const dbName = 'test';

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 60000, // Increase to 60 seconds
  socketTimeoutMS: 60000,
  connectTimeoutMS: 60000,
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  waitQueueTimeoutMS: 60000,
  heartbeatFrequencyMS: 10000,
  directConnection: false
};

// Create a new MongoClient
const client = new MongoClient(url, options);

async function connect() {
  try {
    console.log('Attempting to connect to MongoDB Atlas...');
    // Connect to MongoDB
    await client.connect();
    console.log('Connected successfully to MongoDB');
    
    const db = client.db(dbName);
    return db;
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error);
    if (error.code === 8000) {
      console.error('Authentication failed. Please check your MongoDB Atlas username and password.');
    } else if (error.name === 'MongoServerSelectionError') {
      console.error('Could not connect to MongoDB Atlas. Please check:');
      console.error('1. Your internet connection');
      console.error('2. Your IP address is whitelisted in MongoDB Atlas');
      console.error('3. The MongoDB Atlas cluster is running');
      console.error('4. Your connection string is correct');
      console.error('Current connection string:', url.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@')); // Hide credentials
    }
    throw error; // Re-throw the error instead of exiting
  }
}

// Function to close the database connection
async function closeConnection() {
  try {
    await client.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
}

module.exports = { connect, client, closeConnection }; 