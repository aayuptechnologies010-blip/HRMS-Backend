const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { checkPermission } = require('../middleware/rbacMiddleware');

router.route('/')
  .get(checkPermission('read:payroll'), expenseController.getExpenses)
  .post(checkPermission('create:payroll'), expenseController.submitExpense);

router.route('/:id/approve')
  .put(checkPermission('update:payroll'), expenseController.approveExpense);

module.exports = router;
