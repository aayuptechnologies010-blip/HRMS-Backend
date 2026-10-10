const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('departmentId', 'name').populate('hiringManager', 'firstName lastName');
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.createJob = async (req, res) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find().populate('jobId', 'title');
    res.status(200).json({ success: true, data: candidates });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.createCandidate = async (req, res) => {
  try {
    let resumeUrl = '';
    if (req.file) {
      resumeUrl = req.file.path; // Handled by multer
    }

    const candidate = await Candidate.create({
      ...req.body,
      resumeUrl
    });

    res.status(201).json({ success: true, data: candidate });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};

exports.updateCandidateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!candidate) {
      return res.status(404).json({ success: false, error: { message: 'Candidate not found' } });
    }
    res.status(200).json({ success: true, data: candidate });
  } catch (error) {
    res.status(400).json({ success: false, error: { message: error.message } });
  }
};
