const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { checkPermission } = require('../middleware/rbacMiddleware');

router.route('/my-payslips')
  .get(checkPermission('read:own_payroll'), payrollController.getMyPayslips);

router.route('/generate')
  .post(checkPermission('create:payroll'), payrollController.generatePayroll);

router.route('/runs/:id')
  .get(checkPermission('read:payroll'), payrollController.getPayrollRun);

router.route('/runs/:id/approve')
  .put(checkPermission('approve:payroll'), payrollController.approvePayrollRun);

router.route('/runs/:id/pay')
  .put(checkPermission('approve:payroll'), payrollController.markAsPaid);

module.exports = router;
