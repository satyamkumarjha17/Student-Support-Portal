const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uid: { type: String, required: true, unique: true }, // UID or Employee ID
  email: { 
    type: String, 
    required: true, 
    unique: true,
    validate: {
      validator: function(v) {
        if (this.type === 'Student') {
          return /^[A-Za-z0-9._%+-]+@cuchd\.in$/.test(v);
        } else if (this.type === 'Management') {
          return /^[A-Za-z0-9._%+-]+@cumail\.in$/.test(v);
        }
        return false;
      },
      message: props => `${props.value} is not a valid email format for the selected account role`
    }
  },
  password: { type: String, required: true },
  role: { type: String, required: true },
  type: { type: String, enum: ['Student', 'Management'], required: true },
  
  // Student Specific
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  studentType: { type: String, enum: ['Hosteler', 'Day Scholar'] },
  hostelName: { type: String },
  roomNumber: { type: String },

  // Management Specific
  department: { type: String },

  // OTP and Verification
  otp: { type: String },
  otpExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
