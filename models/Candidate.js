const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  resumeUrl: { type: String },
  status: { 
    type: String, 
    enum: ['Applied', 'Shortlisted', 'Interviewing', 'Selected', 'Offer Sent', 'Offer Accepted', 'Joined', 'Rejected', 'Withdrawn'],
    default: 'Applied'
  },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);
