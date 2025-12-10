const express = require('express');
const router = express.Router();

// Placeholder routes for users
router.get('/stats', (req, res) => {
  res.json({
    totalCapsules: 0,
    totalViews: 0,
    storageUsed: 0
  });
});

router.put('/preferences', (req, res) => {
  res.json({ message: 'Preferences updated successfully' });
});

router.get('/activity', (req, res) => {
  res.json({
    activities: [],
    pagination: { current: 1, pages: 1, total: 0 }
  });
});

module.exports = router;
