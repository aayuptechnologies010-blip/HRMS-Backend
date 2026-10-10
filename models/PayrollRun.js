const mongoose = require('mongoose');

const payrollRunSchema = new mongoose.Schema({
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Draft', 'Verification', 'Approved', 'Paid'], 
    default: 'Draft' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvalDate: { type: Date },
  totalGross: { type: Number, default: 0 },
  totalNet: { type: Number, default: 0 },
  employeeCount: { type: Number, default: 0 },
  records: [{
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    salaryStructureId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalaryStructure' },
    grossSalary: Number,
    netPay: Number,
    deductions: Number,
    additions: Number,
    attendanceDays: Number,
    leaveDeductions: Number
  }]
}, { timestamps: true });

// Ensure one run per month/year
payrollRunSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('PayrollRun', payrollRunSchema);
