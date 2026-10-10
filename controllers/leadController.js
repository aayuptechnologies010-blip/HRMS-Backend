const Lead = require('../models/Lead');

exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().populate('ownerId', 'firstName lastName').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leads });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.createLead = async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

exports.updateLeadStage = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id, 
      { stage: req.body.stage }, 
      { new: true, runValidators: true }
    );
    if (!lead) {
      return res.status(404).json({ success: false, error: { message: 'Lead not found' } });
    }
    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};
