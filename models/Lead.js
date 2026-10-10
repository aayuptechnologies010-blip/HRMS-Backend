const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  client: { type: String, required: true },
  source: { type: String },
  expectedValue: { type: Number },
  stage: { 
    type: String, 
    enum: ['New', 'Contacted', 'Follow-up', 'Meeting', 'Proposal', 'Negotiation', 'Won', 'Lost'], 
    default: 'New' 
  },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  nextFollowUpDate: { type: Date },
  notes: { type: String },
  lossReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
