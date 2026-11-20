import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    // Stored lowercase so the same address can never create two accounts.
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 320 },
    picture: { type: String, default: '', maxlength: 2048 },
    emailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
