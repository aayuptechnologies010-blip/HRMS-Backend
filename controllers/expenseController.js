const Expense = require('../models/Expense');
const Employee = require('../models/Employee');

exports.submitExpense = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ success: false, error: { message: 'Employee not found' } });

    const expense = await Expense.create({
      ...req.body,
      employeeId: employee._id
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    
    let query = {};
    if (req.user.role === 'Employee') {
      query.employeeId = employee._id;
    }

    const expenses = await Expense.find(query)
      .populate('employeeId', 'firstName lastName')
      .populate('approvedBy', 'name')
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.approveExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, error: { message: 'Expense not found' } });

    expense.status = req.body.decision === 'approve' ? 'Approved' : 'Rejected';
    expense.approvedBy = req.user.id;
    await expense.save();

    res.status(200).json({ success: true, data: expense });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};
