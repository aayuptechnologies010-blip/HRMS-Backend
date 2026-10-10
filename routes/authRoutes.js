const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
// Note: /me would need the protect middleware

module.exports = router;
