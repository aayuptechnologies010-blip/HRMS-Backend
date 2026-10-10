const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { checkPermission } = require('../middleware/rbacMiddleware');

router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/my', attendanceController.getMyAttendance);

module.exports = router;
