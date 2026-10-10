const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

const { checkPermission } = require('../middleware/rbacMiddleware');

router.route('/')
  .get(checkPermission('read:department'), departmentController.getDepartments);

module.exports = router;
