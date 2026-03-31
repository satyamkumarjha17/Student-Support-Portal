const User = require('../models/User');
const RegistrationOTP = require('../models/RegistrationOTP');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/emailService');

exports.register = async (req, res) => {
  try {
    const { 
      name, uid, email, password, role, type, gender, 
      studentType, hostelName, roomNumber, department, otp 
    } = req.body;

    if (!otp) return res.status(400).json({ message: 'OTP is required' });

    // Look up the requested OTP
    const registrationOtp = await RegistrationOTP.findOne({ email });
    if (!registrationOtp) return res.status(400).json({ message: 'OTP expired or not requested' });
    
    // Verify OTP exactly
    if (registrationOtp.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

    // Check if user exists officially
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name, uid, email, password: hashedPassword, role, type,
      gender, studentType, hostelName, roomNumber, department
    });

    await newUser.save();
    
    // Wipe transient OTP
    await RegistrationOTP.deleteOne({ email });
    
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, type: user.type, role: user.role, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        role: user.role,
        studentType: user.studentType,
        department: user.department
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// --- OTP Features ---

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Your Password Reset OTP',
      message: `Your OTP for resetting your password is: ${otp}. It is valid for 10 minutes.`
    });

    res.json({ message: 'OTP sent to email successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (Date.now() > user.otpExpires) return res.status(400).json({ message: 'OTP has expired' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.loginWithOtpRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Your Login OTP',
      message: `Your OTP for logging into the portal is: ${otp}. It is valid for 10 minutes.`
    });

    res.json({ message: 'OTP sent to email successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.loginWithOtpVerify = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.otp || user.otp !== otp) return res.status(400).json({ message: 'Invalid or incorrect OTP' });
    if (Date.now() > user.otpExpires) return res.status(400).json({ message: 'OTP has expired' });

    // Clear OTP securely
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Sign Authentication JWT
    const token = jwt.sign(
      { id: user._id, type: user.type, role: user.role, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        type: user.type,
        role: user.role,
        studentType: user.studentType,
        department: user.department
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.sendRegistrationOtp = async (req, res) => {
  try {
    const { email, uid } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { uid }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this Email or UID already exists' });
    }

    const otp = generateOTP();

    await RegistrationOTP.deleteOne({ email });

    const newRegistrationOtp = new RegistrationOTP({ email, otp });
    await newRegistrationOtp.save();

    await sendEmail({
      email,
      subject: 'Verify your Registration Email',
      message: `Your robust Authentication Code to finalize registering your Student Complaint Portal account is: ${otp}. Do not share this. It is valid for exactly 10 minutes.`
    });

    res.json({ message: 'Registration OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
