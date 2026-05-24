const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { generateTaskBreakdown } = require('../controllers/aiController');

const router = express.Router();

router.post('/breakdown', protect, generateTaskBreakdown);

module.exports = router;
