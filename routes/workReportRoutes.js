const express = require('express');
const router = express.Router();
const workReportController = require('../controllers/workReportController');
const { checkPermission } = require('../middleware/rbacMiddleware');

router.route('/')
  .get(checkPermission('read:task'), workReportController.getReports)
  .post(checkPermission('create:task'), workReportController.submitReport);

router.route('/:id/review')
  .put(checkPermission('update:task'), workReportController.reviewReport);

module.exports = router;
