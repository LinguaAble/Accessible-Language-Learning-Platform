const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // Documents automatically delete after 5 minutes
  
  // Used only during new account registration.
  // Stores pending data so we don't pollute the main User collection before verification.
  signupData: {
    password: { type: String },
    username: { type: String }
  }
});

module.exports = mongoose.model('OTP', OTPSchema);
