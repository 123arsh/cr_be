const { Schema, model } = require('mongoose');

const ratingSchema = new Schema({ 
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    comment: {
        type: String,
        required: [true, 'Comment is required'],
        trim: true,
        minlength: [10, 'Comment must be at least 10 characters long'],
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        default: 0
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add index for better query performance
ratingSchema.index({ createdAt: -1 });
ratingSchema.index({ rating: -1 });
ratingSchema.index({ status: 1 });

// Virtual for formatted date
ratingSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString();
});

// Pre-save middleware to ensure rating is a number
ratingSchema.pre('save', function(next) {
    if (this.rating) {
        this.rating = Number(this.rating);
    }
    next();
});

const Rating = model('Rating', ratingSchema);

module.exports = Rating;