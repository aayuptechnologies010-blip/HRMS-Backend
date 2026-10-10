const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  status: { 
    type: String, 
    enum: ['Present', 'Absent', 'Half Day', 'Leave', 'Holiday', 'Weekly Off'], 
    default: 'Present' 
  },
  hoursWorked: { type: Number, default: 0 },
  source: { type: String, enum: ['Web', 'Mobile', 'Biometric', 'Manual'], default: 'Web' },
  correctionRequested: { type: Boolean, default: false },
  correctionReason: { type: String },
  correctionStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'] }
}, { timestamps: true });

// Compound index to ensure one attendance record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
