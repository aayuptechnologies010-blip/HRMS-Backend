const LeaveRequest = require('../models/LeaveRequest');

exports.getLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find().populate('employeeId', 'firstName lastName').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.createLeaveRequest = async (req, res) => {
  try {
    const Employee = require('../models/Employee');
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ success: false, error: { message: 'Employee not found' } });
    
    const { startDate, endDate } = req.body;
    const employeeId = employee._id;
    
    // Check for overlapping requests
    const overlapping = await LeaveRequest.findOne({
      employeeId,
      status: { $in: ['Pending', 'Approved'] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });

    if (overlapping) {
      return res.status(400).json({ success: false, error: { message: 'Leave request overlaps with an existing request' } });
    }

    const payload = {
      ...req.body,
      employeeId
    };
    const leave = await LeaveRequest.create(payload);
    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const { decision } = req.body;
    const leave = await LeaveRequest.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ success: false, error: { message: 'Leave request not found' } });
    }
    
    // An employee cannot approve their own request
    // Assumes leave.employeeId is populated or is ObjectId comparing to req.user.employeeId
    // For MVP, we compare string representations if available, or just check role
    if (leave.employeeId.toString() === req.user.employeeId?.toString()) {
      return res.status(403).json({ success: false, error: { message: 'Cannot approve your own leave request' } });
    }

    leave.status = decision === 'approve' ? 'Approved' : 'Rejected';
    await leave.save();

    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
