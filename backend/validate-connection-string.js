require('dotenv').config();

function validateConnectionString() {
  const uri = process.env.MONGO_URI;
  
  if (!uri) {
    console.error('Error: MONGO_URI is not set in .env file');
    return false;
  }

  if (!uri.startsWith('mongodb+srv://')) {
    console.error('Error: Connection string should start with mongodb+srv://');
    return false;
  }

  const parts = uri.split('@');
  if (parts.length !== 2) {
    console.error('Error: Connection string should contain username:password@host');
    return false;
  }

  const [credentials, host] = parts;
  if (!credentials.includes(':')) {
    console.error('Error: Connection string should include username and password');
    return false;
  }

  if (!host.includes('.mongodb.net')) {
    console.error('Error: Host should be a MongoDB Atlas cluster URL');
    return false;
  }

  console.log('Connection string format is valid');
  return true;
}

console.log('Validating MongoDB connection string...');
const isValid = validateConnectionString();

if (!isValid) {
  console.log('\nPlease update your .env file with a valid MongoDB Atlas connection string:');
  console.log(`
PORT=5000
MONGO_URI=mongodb+srv://rehabmohamed:<your-password>@cluster0.xxxxx.mongodb.net/event-booking?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
  `);
} 