const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');

exports.checkIn = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) return res.status(404).json({ success: false, error: { message: 'Employee not found' } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let record = await Attendance.findOne({ employeeId: employee._id, date: today });
    if (record) {
      return res.status(400).json({ success: false, error: { message: 'Already checked in today' } });
    }

    record = await Attendance.create({
      employeeId: employee._id,
      date: today,
      checkIn: new Date(),
      status: 'Present'
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await Attendance.findOne({ employeeId: employee._id, date: today });
    if (!record) {
      return res.status(400).json({ success: false, error: { message: 'No check-in record found for today' } });
    }
    if (record.checkOut) {
      return res.status(400).json({ success: false, error: { message: 'Already checked out today' } });
    }

    const now = new Date();
    const hoursWorked = (now - record.checkIn) / (1000 * 60 * 60);

    record.checkOut = now;
    record.hoursWorked = hoursWorked;
    await record.save();

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    const records = await Attendance.find({ employeeId: employee._id }).sort({ date: -1 });
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
