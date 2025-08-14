const express = require('express');
const router = express.Router();
const Rating = require('../models/rating');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Get all ratings with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    // const status = req.query.status || 'approved';

    // const query = { status };
    const query = {};
    
    const ratings = await Rating.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Rating.countDocuments(query);

    res.json({
      ratings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRatings: total
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ message: 'Error fetching ratings' });
  }
});

// Create a new rating
router.post('/', async (req, res) => {
  try {
    const { name, comment, rating, email } = req.body;

    // Basic validation
    if (!name || !comment || !rating) {
      return res.status(400).json({ message: 'Name, comment, and rating are required' });
    }

    // Create new rating
    const newRating = new Rating({
      name,
      comment,
      rating,
      email,
      status: 'pending' // All new ratings start as pending
    });

    // Save the rating
    await newRating.save();

    res.status(201).json({
      message: 'Rating submitted successfully and pending approval',
      rating: newRating
    });
  } catch (error) {
    console.error('Error creating rating:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Error creating rating' });
  }
});

// Admin route to update rating status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const rating = await Rating.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    res.json({ message: 'Rating status updated successfully', rating });
  } catch (error) {
    console.error('Error updating rating status:', error);
    res.status(500).json({ message: 'Error updating rating status' });
  }
});

module.exports = router; 