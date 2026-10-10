const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeIdString: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation: { type: String, required: true },
  reportingManagerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  joiningDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['Candidate', 'Offer Sent', 'Offer Accepted', 'Active', 'Notice Period', 'Exited'], 
    default: 'Active' 
  },
  shift: { type: String, default: 'General' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
