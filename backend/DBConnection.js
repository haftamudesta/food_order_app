const mongoose = require('mongoose');
const path = require('path');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log("🔄 Connecting to MongoDB...");
    
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in config.env');
    }
    await mongoose.connect(uri);
    
    console.log('✅ MongoDB connected successfully!');
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error; 
  }
};

module.exports = connectDB;