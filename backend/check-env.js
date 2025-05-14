require('dotenv').config();

console.log('Checking environment variables...');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'is set' : 'is not set');
console.log('PORT:', process.env.PORT || 'not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'is set' : 'is not set');

if (!process.env.MONGO_URI) {
  console.error('\nError: MONGO_URI is not set in your .env file');
  console.log('\nPlease create a .env file in your backend directory with:');
  console.log(`
PORT=5000
MONGO_URI=mongodb+srv://rehabmohamed:<your-password>@cluster0.xxxxx.mongodb.net/event-booking?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_here
  `);
} 