const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

const { checkPermission } = require('../middleware/rbacMiddleware');

// Define routes
router.route('/')
  .get(checkPermission('read:employee'), employeeController.getEmployees)
  .post(checkPermission('create:employee'), employeeController.createEmployee);

module.exports = router;
