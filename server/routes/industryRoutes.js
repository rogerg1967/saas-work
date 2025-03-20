const express = require('express');
const router = express.Router();

// List of industries used throughout the application
const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Media',
  'Telecommunications',
  'Transportation',
  'Energy',
  'Construction',
  'Agriculture',
  'Hospitality',
  'Real Estate',
  'Legal Services',
  'Consulting',
  'Entertainment',
  'Non-profit',
  'Government',
  'Other'
];

// Get all industries
router.get('/', (req, res) => {
  try {
    console.log('Fetching list of industries');
    return res.json({
      success: true,
      industries: INDUSTRIES
    });
  } catch (error) {
    console.error('Error fetching industries:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;