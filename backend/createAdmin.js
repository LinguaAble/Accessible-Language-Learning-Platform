const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Import your User model
require('dotenv').config(); // Load database URL

// 1. Connect to Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to DB...'))
  .catch(err => console.log(err));

const createTestUser = async () => {
  try {
    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('⚠️ User already exists!');
      process.exit();
    }

    // 3. Encrypt a password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 4. Create the User (With ADHD Preferences automatically set)
    const newUser = new User({
      email: 'test@example.com',
      password: hashedPassword
      // preferences will use the defaults we wrote in User.js
    });

    await newUser.save();
    console.log('🎉 Success! User created:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

createTestUser();