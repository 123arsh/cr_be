const { model, Schema } = require('mongoose');
const { createHmac, randomBytes } = require('crypto');
const jwt = require('jsonwebtoken');

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phNumber: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  salt: {
    type: String,
    select: false,
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  if (!this.password) return next(new Error('Password is required'));

  const salt = randomBytes(16).toString('hex');
  const hashPassword = createHmac('sha256', salt)
    .update(this.password)
    .digest('hex');

  this.salt = salt;
  this.password = hashPassword;
  next();
});

// Static login method
userSchema.statics.MatchPasswordAndGenerateToken = async function (email, password) {
  const user = await this.findOne({ email }).select('+password +salt');
  if (!user) {
    throw new Error('User not found');
  }

  const userProvidedHash = createHmac('sha256', user.salt)
    .update(password)
    .digest('hex');

  if (user.password !== userProvidedHash) {
    throw new Error('Incorrect email or password');
  }

  // Generate JWT token with hardcoded secret
  const token = jwt.sign(
    { _id: user._id, email: user.email },
    'your-super-secret-temporary-key-123',
    { expiresIn: '7d' }
  );

  return token;
};

const user = model('user', userSchema);
module.exports = user;
