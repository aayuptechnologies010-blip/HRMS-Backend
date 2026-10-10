const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  interviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  round: { type: Number, required: true, default: 1 },
  type: { type: String, enum: ['Technical', 'HR', 'Managerial', 'Other'], required: true },
  scheduledAt: { type: Date, required: true },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'No Show'], default: 'Scheduled' },
  feedback: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  recommendation: { type: String, enum: ['Hire', 'Strong Hire', 'Reject', 'Hold'] }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
