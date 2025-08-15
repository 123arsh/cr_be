const express = require('express');
const router = express.Router();
const user = require('../models/user');
const { signup } = require('../controller/auth');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const verifyToken = require('../middlewares/auth');

// Check authentication status
router.get('/check-auth', verifyToken, (req, res) => {
    res.json({ 
        isAuthenticated: true, 
        user: req.user 
    });
});

// Signup route
router.post('/signup', signup);

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: 'Please provide email and password'
        });
    }

    try {
        const token = await user.MatchPasswordAndGenerateToken(email, password);

        // Set cookie with token (cross-site friendly)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            partitioned: true,
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000
          });

        // Find user data (excluding sensitive fields)
        const userData = await user.findOne({ email }).select('-password -salt');

        return res.json({
            message: 'Login successful',
            user: userData
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(401).json({
            message: err.message || 'Invalid email or password'
        });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'None',
        path: '/'
    });
    res.json({ message: 'Logged out successfully' });
});

// Protected routes
router.get('/user', verifyToken, async (req, res) => {
    try {
        const users = await user.find().select('-password -salt');
        if (!users || users.length === 0) {
            return res.status(404).json({
                message: 'No users found',
            });
        }
        return res.status(200).json({
            message: 'Users fetched successfully',
            users,
        });
    } catch (error) {
        console.error('Fetch users error:', error);
        return res.status(500).json({
            message: 'Failed to fetch users',
            error: error.message
        });
    }
});

router.get('/favicon.ico', (req, res) => res.status(204).end());

router.get('/:id', verifyToken, async (req, res) => {
    try {
        const userData = await user.findById(req.params.id).select('-password -salt');
        if (!userData) {
            return res.status(404).json({
                message: 'User not found',
            });
        }
        return res.json(userData);
    } catch (err) {
        console.error('Fetch user error:', err);
        return res.status(500).json({
            message: 'Failed to fetch user',
            error: err.message
        });
    }
});

// Test email route
router.post('/test-email', verifyToken, async (req, res) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: req.body.email,
            subject: 'Test Email from Car Rental',
            text: 'If you receive this email, your email configuration is working correctly!'
        });

        res.json({ message: 'Test email sent successfully!' });
    } catch (error) {
        console.error('Email test error:', error);
        res.status(500).json({ 
            message: 'Failed to send test email', 
            error: error.message,
            config: {
                emailConfigured: !!process.env.EMAIL_USER,
                emailValid: process.env.EMAIL_USER?.includes('@')
            }
        });
    }
});

module.exports = router;
