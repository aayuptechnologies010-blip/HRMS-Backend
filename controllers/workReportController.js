const WorkReport = require('../models/WorkReport');
const Employee = require('../models/Employee');

exports.submitReport = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    if (!employee) {
      return res.status(404).json({ success: false, error: { message: 'Employee record not found' } });
    }

    const report = await WorkReport.create({
      ...req.body,
      employeeId: employee._id
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

exports.getReports = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user.id });
    
    let query = {};
    // If not Admin/HR/Manager, only see own reports
    if (req.user.role === 'Employee') {
      query.employeeId = employee._id;
    }

    const reports = await WorkReport.find(query)
      .populate('employeeId', 'firstName lastName')
      .populate('reviewedBy', 'name')
      .sort({ date: -1 });

    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.reviewReport = async (req, res) => {
  try {
    const { managerFeedback } = req.body;
    
    const report = await WorkReport.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Reviewed',
        managerFeedback,
        reviewedBy: req.user.id,
        reviewedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, error: { message: 'Report not found' } });
    }

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};
