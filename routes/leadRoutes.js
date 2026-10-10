const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');

const { checkPermission } = require('../middleware/rbacMiddleware');

router.route('/')
  .get(checkPermission('read:lead'), leadController.getLeads)
  .post(checkPermission('create:lead'), leadController.createLead);

router.route('/:id/stage')
  .patch(checkPermission('update:lead'), leadController.updateLeadStage);

module.exports = router;
