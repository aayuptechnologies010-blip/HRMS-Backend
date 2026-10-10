const Employee = require('../models/Employee');
const Department = require('../models/Department');

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate('departmentId', 'name').select('-__v');
    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const newEmployee = await Employee.create(req.body);
    res.status(201).json({ success: true, data: newEmployee });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};
