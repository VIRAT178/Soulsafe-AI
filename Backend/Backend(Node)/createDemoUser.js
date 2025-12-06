const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soulsafe', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected');
  
  const User = require('./models/UserModel');
  
  const demoEmail = 'demo@soulsafe.ai';
  
  // Delete existing demo user if exists
  await User.deleteOne({ email: demoEmail });
  console.log('Removed existing demo user (if any)');
  
  // Create new demo user
  const demoUser = await User.create({
    username: 'demo_user',
    email: demoEmail,
    password: 'demo123', // Will be hashed by pre-save hook
    firstName: 'Demo',
    lastName: 'User',
    preferences: {
      theme: 'dark',
      notifications: {
        email: true,
        push: true
      }
    }
  });
  
  console.log('✅ Demo user created successfully!');
  console.log('Email:', demoUser.email);
  console.log('Password: demo123');
  console.log('User ID:', demoUser._id);
  
  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
