const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  description: { type: String, required: true },
  requirements: { type: String },
  positions: { type: Number, default: 1 },
  status: { type: String, enum: ['Draft', 'Open', 'On Hold', 'Closed'], default: 'Draft' },
  hiringManager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  deadline: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
