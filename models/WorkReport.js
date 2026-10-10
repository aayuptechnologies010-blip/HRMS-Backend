const mongoose = require('mongoose');

const workReportSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  summary: { type: String, required: true },
  hoursWorked: { type: Number, required: true, default: 8 },
  status: { type: String, enum: ['Submitted', 'Reviewed'], default: 'Submitted' },
  managerFeedback: { type: String },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('WorkReport', workReportSchema);
