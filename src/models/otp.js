const mongoose = require("mongoose") ;

const otpSchema = new mongoose.Schema({
  emailId: {
    type: String,
    required: true,
    unique: true
  },
  otp: {
    type: String,
    // required: true
  },
  createdAt: { 
    type: Date,
    default: Date.now,
    expires: 300 // 5 minutes 
  }
});

const OTP = mongoose.model('Otp', otpSchema);
module.exports = OTP ;