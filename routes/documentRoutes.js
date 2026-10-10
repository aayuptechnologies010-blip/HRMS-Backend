const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { checkPermission } = require('../middleware/rbacMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(checkPermission('read:document'), documentController.getDocuments)
  .post(
    checkPermission('create:document'),
    upload.single('file'), 
    documentController.uploadDocument
  );

router.route('/:id/download')
  .get(checkPermission('read:document'), documentController.downloadDocument);

module.exports = router;
