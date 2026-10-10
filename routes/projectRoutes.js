const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

const { checkPermission } = require('../middleware/rbacMiddleware');

// Define routes
router.route('/')
  .get(checkPermission('read:project'), projectController.getProjects);
router.route('/tasks')
  .get(checkPermission('read:task'), projectController.getTasks);

router.route('/tasks/:id/status')
  .patch(checkPermission('update:task'), projectController.updateTaskStatus);

module.exports = router;
