const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

const { checkPermission } = require('../middleware/rbacMiddleware');

router.route('/')
  .get(checkPermission('read:leave'), leaveController.getLeaveRequests)
  .post(checkPermission('create:leave'), leaveController.createLeaveRequest);

router.route('/:id/approve')
  .put(checkPermission('approve:leave'), leaveController.approveLeave);

module.exports = router;
