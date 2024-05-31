const express = require('express');
const { registerUser, authUser } = require('../controllers/authController');
const router = express.Router();

// Register a new user
router.post('/register', registerUser);

// Authenticate user and get token
router.post('/login', authUser);

module.exports = router;
