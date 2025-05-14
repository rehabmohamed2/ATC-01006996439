const { connect, closeConnection } = require('./config/database');
require('dotenv').config();

async function testConnection() {
  console.log('Starting connection test...');
  console.log('MongoDB URI:', process.env.MONGO_URI ? 'URI is set' : 'URI is not set');
  
  try {
    console.log('Attempting to connect to MongoDB...');
    const db = await connect();
    console.log('Successfully connected to MongoDB!');
    
    console.log('Listing collections...');
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    console.log('Testing collection creation...');
    const testCollection = db.collection('test_collection');
    await testCollection.insertOne({ test: 'data', timestamp: new Date() });
    console.log('Successfully inserted test document');
    
    await testCollection.deleteOne({ test: 'data' });
    console.log('Cleaned up test data');
    
    await closeConnection();
    console.log('Connection closed successfully');
  } catch (error) {
    console.error('Connection test failed with error:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
  }
}

console.log('Script started');
testConnection().then(() => {
  console.log('Test completed');
}).catch(err => {
  console.error('Unhandled error:', err);
}); 