const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  client: { type: String },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'], 
    default: 'Active' 
  },
  deadline: { type: Date },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
