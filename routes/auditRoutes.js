const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { checkPermission } = require('../middleware/rbacMiddleware');

// Only Super Admins can read audit logs
router.route('/')
  .get(checkPermission('read:audit'), auditController.getAuditLogs);

module.exports = router;
