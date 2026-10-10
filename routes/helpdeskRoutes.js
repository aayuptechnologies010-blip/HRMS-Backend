const express = require('express');
const router = express.Router();
const helpdeskController = require('../controllers/helpdeskController');
const { checkPermission } = require('../middleware/rbacMiddleware');

router.route('/')
  .get(checkPermission('read:helpdesk'), helpdeskController.getTickets)
  .post(checkPermission('create:helpdesk'), helpdeskController.createTicket);

module.exports = router;
