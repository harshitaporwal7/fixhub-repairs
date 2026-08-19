const mongoose = require('mongoose');
const env = require('./env');

async function connectDB() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.error(`Attempted URI: ${env.MONGODB_URI}`);
    console.error('Make sure MongoDB is running locally, or set MONGODB_URI in backend/.env to a MongoDB Atlas connection string.');
    process.exit(1);
  }
}

module.exports = connectDB;
