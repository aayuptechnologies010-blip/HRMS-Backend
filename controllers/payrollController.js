const PayrollRun = require('../models/PayrollRun');
const Payslip = require('../models/Payslip');
const SalaryStructure = require('../models/SalaryStructure');
const Employee = require('../models/Employee');

exports.getMyPayslips = async (req, res) => {
  try {
    // req.user has the current logged in user. Need to find their employee record
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, error: { message: 'Employee profile not found' } });
    }

    const payslips = await Payslip.find({ employeeId: employee._id, status: 'Published' })
      .sort({ year: -1, month: -1 });

    res.status(200).json({ success: true, data: payslips });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.generatePayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    
    // Check if run exists
    let run = await PayrollRun.findOne({ month, year });
    if (run) {
      return res.status(400).json({ success: false, error: { message: 'Payroll run already exists for this period' } });
    }

    // Get all active employees with salary structures
    const employees = await Employee.find({ status: 'Active' });
    const records = [];
    let totalGross = 0;
    let totalNet = 0;

    for (const emp of employees) {
      const structure = await SalaryStructure.findOne({ employeeId: emp._id, isActive: true });
      if (structure) {
        records.push({
          employeeId: emp._id,
          salaryStructureId: structure._id,
          grossSalary: structure.grossSalary,
          netPay: structure.netPay,
          deductions: structure.deductions.pf + structure.deductions.tax + structure.deductions.other,
          additions: 0,
          attendanceDays: 22, // Dummy for MVP
          leaveDeductions: 0
        });
        totalGross += structure.grossSalary;
        totalNet += structure.netPay;
      }
    }

    run = await PayrollRun.create({
      month,
      year,
      status: 'Draft',
      employeeCount: records.length,
      totalGross,
      totalNet,
      records
    });

    res.status(201).json({ success: true, data: { runId: run._id, status: run.status } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.getPayrollRun = async (req, res) => {
  try {
    const run = await PayrollRun.findById(req.params.id)
      .populate('records.employeeId', 'firstName lastName employeeIdString');
    
    if (!run) {
      return res.status(404).json({ success: false, error: { message: 'Payroll run not found' } });
    }

    res.status(200).json({ success: true, data: run });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.approvePayrollRun = async (req, res) => {
  try {
    const { decision } = req.body;
    
    const run = await PayrollRun.findById(req.params.id);
    if (!run) {
      return res.status(404).json({ success: false, error: { message: 'Payroll run not found' } });
    }

    if (run.status === 'Paid') {
      return res.status(400).json({ success: false, error: { message: 'Cannot modify a Paid payroll run' } });
    }

    run.status = decision === 'approve' ? 'Approved' : 'Draft';
    if (decision === 'approve') {
      run.approvedBy = req.user.id;
      run.approvalDate = new Date();
    }
    await run.save();

    res.status(200).json({ success: true, data: { runId: run._id, status: run.status } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const run = await PayrollRun.findById(req.params.id);
    if (!run) {
      return res.status(404).json({ success: false, error: { message: 'Payroll run not found' } });
    }

    if (run.status !== 'Approved') {
      return res.status(400).json({ success: false, error: { message: 'Payroll must be Approved before marking as Paid' } });
    }

    // Business Rule: A payment must not become Paid without payment confirmation
    // Assume payment confirmation is provided in body
    const { paymentConfirmationRef } = req.body;
    if (!paymentConfirmationRef) {
      return res.status(400).json({ success: false, error: { message: 'Payment confirmation reference is required' } });
    }

    run.status = 'Paid';
    await run.save();

    // Business Rule: Payroll cannot be published before the required approvals/payment
    for (const record of run.records) {
      await Payslip.findOneAndUpdate(
        { employeeId: record.employeeId, month: run.month, year: run.year },
        {
          payrollRunId: run._id,
          grossSalary: record.grossSalary,
          netPay: record.netPay,
          status: 'Published'
        },
        { upsert: true }
      );
    }

    res.status(200).json({ success: true, data: { runId: run._id, status: run.status } });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
