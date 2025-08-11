require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const fixDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Get the database instance
    const db = mongoose.connection.db;
    
    // Drop the problematic index
    try {
      await db.collection('users').dropIndex('username_1');
      console.log('Successfully dropped username index');
    } catch (err) {
      console.log('Username index not found or already dropped');
    }
    
    // Create the correct index on email
    try {
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      console.log('Successfully created email index');
    } catch (err) {
      console.log('Email index already exists');
    }
    
    console.log('Database fixed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing database:', err);
    process.exit(1);
  }
};

fixDatabase(); 