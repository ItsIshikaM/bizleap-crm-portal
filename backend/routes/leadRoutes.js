const express = require('express');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

const isFollowUpBeforeCreation = (followUpDate, createdDate) => {
  if (!followUpDate) return false;
  const fDate = new Date(followUpDate);
  const cDate = new Date(createdDate || Date.now());
  fDate.setHours(0, 0, 0, 0);
  cDate.setHours(0, 0, 0, 0);
  return fDate < cDate;
};

// GET all leads
router.get('/', protect, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdDate: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching leads' });
  }
});

// POST create a new lead
router.post('/', protect, async (req, res) => {
  try {
    const {
      fullName,
      email,
      countryCode,
      phone,
      companyName,
      industry,
      location,
      leadSource,
      leadStatus,
      followUpDate,
      followUpCompleted,
      notes,
    } = req.body;

    if (!fullName || !email || !countryCode || !phone || !companyName) {
      return res.status(400).json({
        message: 'Full Name, Email, Country Code, Phone Number, and Company Name are required',
      });
    }

    const existingLead = await Lead.findOne({ email: email.trim().toLowerCase() });
    if (existingLead) {
      return res.status(409).json({ message: 'A lead with this email address already exists' });
    }

    const now = new Date();
    if (isFollowUpBeforeCreation(followUpDate, now)) {
      return res.status(400).json({ message: 'Follow-up date cannot be earlier than the lead creation date' });
    }

    const newLead = await Lead.create({
      fullName,
      email,
      countryCode,
      phone,
      companyName,
      industry,
      location,
      leadSource,
      leadStatus,
      followUpDate: followUpDate || null,
      followUpCompleted: Boolean(followUpCompleted),
      notes,
      createdDate: now,
    });

    res.status(201).json(newLead);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A lead with this email address already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// PUT update a lead
router.put('/:id', protect, async (req, res) => {
  try {
    const existing = await Lead.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Lead not found' });

    if (req.body.email && req.body.email.trim().toLowerCase() !== existing.email) {
      const duplicate = await Lead.findOne({ email: req.body.email.trim().toLowerCase() });
      if (duplicate) {
        return res.status(409).json({ message: 'Another lead already uses this email address' });
      }
    }

    if (req.body.followUpDate && isFollowUpBeforeCreation(req.body.followUpDate, existing.createdDate)) {
      return res.status(400).json({ message: 'Follow-up date cannot be earlier than the lead creation date' });
    }

    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedLead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST bulk delete selected leads
router.post('/bulk-delete', protect, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No leads selected for deletion' });
    }
    await Lead.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${ids.length} lead(s) deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting selected leads' });
  }
});

// DELETE a single lead
router.delete('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting lead' });
  }
});

module.exports = router;