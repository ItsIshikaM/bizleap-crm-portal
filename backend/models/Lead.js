const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  fullName: { type: String, required: [true, 'Full Name is required'], trim: true },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  countryCode: {
    type: String,
    required: [true, 'Country code is required'],
    trim: true,
    default: '+91',
    match: [/^\+\d{1,4}$/, 'Invalid country code (e.g., +91, +1)'],
  },
  phone: {
    type: String,
    required: [true, 'Phone Number is required'],
    trim: true,
    match: [/^[\d\s()-]{6,15}$/, 'Please enter a valid phone number (6-15 digits)'],
  },
  companyName: { type: String, required: [true, 'Company Name is required'], trim: true },
  industry: {
    type: String,
    enum: ['SaaS / IT', 'FinTech', 'E-Commerce', 'Healthcare', 'Marketing / Agency', 'Manufacturing', 'Other'],
    default: 'SaaS / IT',
  },
  location: { type: String, trim: true, default: '' },
  leadSource: {
    type: String,
    enum: ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Other'],
    default: 'Website',
  },
  leadStatus: {
    type: String,
    enum: ['New', 'Contacted', 'Interested', 'Converted', 'Lost'],
    default: 'New',
  },
  followUpDate: { type: Date, default: null },
  followUpCompleted: { type: Boolean, default: false },
  notes: { type: String, trim: true, default: '' },
  createdDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Lead', leadSchema);