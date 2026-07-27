const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

async function clearDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Drop the database
    await mongoose.connection.dropDatabase();
    console.log('Database dropped successfully');
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase();
