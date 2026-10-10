const express = require('express');
const router = express.Router();
const recruitmentController = require('../controllers/recruitmentController');
const { checkPermission } = require('../middleware/rbacMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Job Routes
router.route('/jobs')
  .get(checkPermission('read:recruitment'), recruitmentController.getJobs)
  .post(checkPermission('create:recruitment'), recruitmentController.createJob);

// Candidate Routes
router.route('/candidates')
  .get(checkPermission('read:recruitment'), recruitmentController.getCandidates)
  .post(
    checkPermission('create:recruitment'), 
    upload.single('resume'), 
    recruitmentController.createCandidate
  );

router.route('/candidates/:id/status')
  .patch(checkPermission('update:recruitment'), recruitmentController.updateCandidateStatus);

module.exports = router;
