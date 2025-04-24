const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  photoURL: {
    type: String
  },
  online: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  verificationTokenExpiry: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.methods.getInitial = function() {
  return this.displayName ? this.displayName.charAt(0).toUpperCase() : '?';
};

userSchema.virtual('initial').get(function() {
  return this.getInitial();
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.initial = doc.getInitial();
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema); 