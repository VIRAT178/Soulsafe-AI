const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/UserModel');

const checkUserPassword = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/soulsafe';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ Connected to MongoDB');

    // Find the user
    const user = await User.findOne({ email: 'vishalsinghvicky95@gmail.com' });
    if (!user) {
      console.log('✗ User not found');
      await mongoose.connection.close();
      return;
    }

    console.log('✓ User found:');
    console.log('  Email:', user.email);
    console.log('  Username:', user.username);
    console.log('  Hashed Password:', user.password);
    console.log('  Password length:', user.password ? user.password.length : 0);

    // Test password comparison
    const testPassword = 'Test@123456';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log('\nPassword verification:');
    console.log('  Test password:', testPassword);
    console.log('  Match result:', isMatch);

    // Try to reset the password
    console.log('\n--- Resetting password ---');
    const newHashedPassword = await bcrypt.hash('Test@123456', 10);
    user.password = newHashedPassword;
    await user.save();
    console.log('✓ Password reset successfully');

    // Verify the new password
    const newUser = await User.findOne({ email: 'vishalsinghvicky95@gmail.com' });
    const newMatch = await bcrypt.compare('Test@123456', newUser.password);
    console.log('✓ New password verification:', newMatch);

    await mongoose.connection.close();
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
};

checkUserPassword();
