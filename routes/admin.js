const express = require('express');
const router = express.Router();
const adminController = require('../controller/admin');

// Admin signup
router.post('/signup', adminController.signup);
// Admin login
router.post('/login', adminController.login);
// Admin token verification
router.get('/verify', adminController.verify);

module.exports = router; 