const mongoose = require('mongoose');

const registrationOTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, expires: 600, default: Date.now } // MongoDB automatically clears this doc after 10 mins!
});

module.exports = mongoose.model('RegistrationOTP', registrationOTPSchema);
