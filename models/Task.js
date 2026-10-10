const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  status: { 
    type: String, 
    enum: ['Created', 'Assigned', 'Accepted', 'In Progress', 'In Review', 'Completed', 'Blocked', 'On Hold', 'Cancelled'], 
    default: 'Created' 
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  dueDate: { type: Date },
  estimatedHours: { type: Number },
  loggedHours: { type: Number, default: 0 },
  blockerInfo: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
