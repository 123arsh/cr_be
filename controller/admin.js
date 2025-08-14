const Admin = require('../models/admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin Signup
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      isVerified: true
    });
    // Generate JWT
    const token = jwt.sign(
      { _id: admin._id, email: admin.email, isAdmin: true },
      process.env.JWT_SECRET || 'your-super-secret-temporary-key-123',
      { expiresIn: '7d' }
    );
    res.status(201).json({ message: 'Admin created successfully', token, admin: { firstName: admin.firstName, lastName: admin.lastName, email: admin.email } });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error: error.message });
  }
};

// Admin Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }
    // Allow login by email or username (here, username is email)
    const admin = await Admin.findOne({ email: username });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Generate JWT
    const token = jwt.sign(
      { _id: admin._id, email: admin.email, isAdmin: true },
      process.env.JWT_SECRET || 'your-super-secret-temporary-key-123',
      { expiresIn: '7d' }
    );
    res.json({ message: 'Login successful', token, admin: { firstName: admin.firstName, lastName: admin.lastName, email: admin.email } });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Admin Token Verification
exports.verify = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-temporary-key-123');
    res.json({ valid: true, admin: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Invalid or expired token' });
  }
}; 