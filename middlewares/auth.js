const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyToken = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ 
                isAuthenticated: false,
                message: 'No token provided'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-temporary-key-123');
            
            // Find user
            const user = await User.findById(decoded._id).select('-password -salt');
            
            if (!user) {
                return res.status(401).json({ 
                    isAuthenticated: false,
                    message: 'User not found'
                });
            }

            // Attach user to request
            req.user = user;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    isAuthenticated: false,
                    message: 'Token expired'
                });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    isAuthenticated: false,
                    message: 'Invalid token'
                });
            }
            throw error;
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ 
            isAuthenticated: false,
            message: 'Internal server error'
        });
    }
};

module.exports = verifyToken; 