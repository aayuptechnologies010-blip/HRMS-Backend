const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  payrollRunId: { type: mongoose.Schema.Types.ObjectId, ref: 'PayrollRun', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  grossSalary: { type: Number, required: true },
  netPay: { type: Number, required: true },
  status: { type: String, enum: ['Published', 'Hidden'], default: 'Published' },
  documentUrl: { type: String } // Reference to private storage
}, { timestamps: true });

payslipSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payslip', payslipSchema);
