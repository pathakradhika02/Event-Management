const mongoose = require('mongoose');

const userOtpSchema = new mongoose.Schema( { 
    email: {
      type: String,
      required : true,
      trim: true
    },
    otp: {
      type: String,
      required : true,
      trim: true
    },
    otpToken : {
      type: String,
      required: true,
      trim: true
    }
  } , { timestamps: true });

  module.exports = mongoose.model('otp', userOtpSchema) 