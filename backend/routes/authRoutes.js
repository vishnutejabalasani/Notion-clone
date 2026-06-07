const express = require('express');
const { registerUser, loginUser, getUserActivities } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/activities', protect, getUserActivities);

module.exports = router;
