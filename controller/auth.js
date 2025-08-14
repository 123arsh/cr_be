const User = require('../models/user');

const signup = async (req, res) => {
    try {
        const { firstName, lastName, phNumber, email, password } = req.body;
        
        // Validate required fields
        if (!firstName || !lastName || !phNumber || !email || !password) {
            return res.status(400).json({ 
                message: 'All fields are required',
                missingFields: {
                    firstName: !firstName,
                    lastName: !lastName,
                    phNumber: !phNumber,
                    email: !email,
                    password: !password
                }
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'User with this email already exists',
                field: 'email'
            });
        }
        
        // Create user
        const newUser = await User.create({
            firstName,
            lastName,
            phNumber,
            email,
            password
        });

        // Generate JWT token
        const token = await User.MatchPasswordAndGenerateToken(email, password);

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return res.status(201).json({
            message: 'User created successfully',
            token
        });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({
            message: 'Error in signup process',
            error: error.message
        });
    }
};

module.exports = {
    signup
}; 