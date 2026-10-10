const Document = require('../models/Document');
const Employee = require('../models/Employee');
const path = require('path');
const fs = require('fs');

exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
    }

    const { title, category, employeeId, expiryDate } = req.body;
    
    // Security check: Only Admin/HR can upload for other employees
    if (employeeId && req.user.role !== 'Super Admin' && req.user.role !== 'HR Manager') {
      const emp = await Employee.findOne({ userId: req.user.id });
      if (emp._id.toString() !== employeeId) {
        // Delete the temporarily uploaded file by multer if unauthorized
        fs.unlinkSync(req.file.path);
        return res.status(403).json({ success: false, error: { message: 'Not authorized to upload to this profile' } });
      }
    }

    const doc = await Document.create({
      title,
      category,
      employeeId: employeeId || null,
      uploadedBy: req.user.id,
      filePath: req.file.path,
      fileName: req.file.originalname,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      expiryDate: expiryDate || null
    });

    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const { employeeId, category } = req.query;
    const query = { status: 'Active' };
    
    if (category) query.category = category;

    // RBAC logic for viewing documents
    if (req.user.role !== 'Super Admin' && req.user.role !== 'HR Manager') {
      const me = await Employee.findOne({ userId: req.user.id });
      query.$or = [
        { employeeId: me._id },
        { employeeId: null } // Company-wide policies
      ];
    } else if (employeeId) {
      query.employeeId = employeeId;
    }

    const docs = await Document.find(query)
      .populate('employeeId', 'firstName lastName')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, data: docs });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.downloadDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: { message: 'Document not found' } });
    }

    // Access control:
    if (req.user.role !== 'Super Admin' && req.user.role !== 'HR Manager') {
      const me = await Employee.findOne({ userId: req.user.id });
      if (doc.employeeId && doc.employeeId.toString() !== me._id.toString()) {
        return res.status(403).json({ success: false, error: { message: 'Not authorized to download this document' } });
      }
    }

    const absolutePath = path.resolve(doc.filePath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, error: { message: 'File not found on server' } });
    }

    res.download(absolutePath, doc.fileName);
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
