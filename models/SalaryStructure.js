const mongoose = require('mongoose');

const salaryStructureSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  effectiveDate: { type: Date, required: true },
  basicSalary: { type: Number, required: true },
  allowances: {
    hra: { type: Number, default: 0 },
    conveyance: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    special: { type: Number, default: 0 }
  },
  deductions: {
    pf: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  grossSalary: { type: Number, required: true },
  netPay: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('SalaryStructure', salaryStructureSchema);
