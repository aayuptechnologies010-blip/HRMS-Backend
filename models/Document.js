const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Resumes', 'Identity', 'Employment', 'Offer Letters', 'Contracts', 'Certificates', 'Policies', 'Onboarding', 'Letters', 'Payslips', 'Other']
  },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }, // Null for general company policies
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filePath: { type: String, required: true },
  fileName: { type: String, required: true },
  mimeType: { type: String, required: true },
  sizeBytes: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Archived', 'Expired'], default: 'Active' },
  expiryDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
