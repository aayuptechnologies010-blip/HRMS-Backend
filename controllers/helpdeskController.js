const HelpdeskTicket = require('../models/HelpdeskTicket');
const Employee = require('../models/Employee');

exports.createTicket = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ success: false, error: { message: 'Employee not found' } });

    const ticket = await HelpdeskTicket.create({
      ...req.body,
      employeeId: employee._id
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

exports.getTickets = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    
    let query = {};
    if (req.user.role === 'Employee') {
      query.employeeId = employee._id;
    } else {
      // If HR, they can see all. But confidential complaints are restricted.
      if (req.user.role !== 'Super Admin' && req.user.role !== 'HR Manager') {
         query.isConfidential = false; // Only HR and Super Admin can see confidential complaints of others.
      }
    }

    const tickets = await HelpdeskTicket.find(query)
      .populate('employeeId', 'firstName lastName')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
