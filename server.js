const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Basic Route
app.get('/api/v1', (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome to AAYUP HRMS API' });
});

// Define API Routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const projectRoutes = require('./routes/projectRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const leadRoutes = require('./routes/leadRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const documentRoutes = require('./routes/documentRoutes');
const recruitmentRoutes = require('./routes/recruitmentRoutes');
const workReportRoutes = require('./routes/workReportRoutes');
const auditRoutes = require('./routes/auditRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const { protect } = require('./middleware/authMiddleware');
const { logAction } = require('./middleware/auditMiddleware');

// Mount routes
app.use('/api/v1/auth', authRoutes);

// Protected routes
app.use(protect);
app.use((req, res, next) => {
  if (req.method !== 'GET') {
    return logAction()(req, res, next);
  }
  next();
});

app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/leaves', leaveRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/recruitment', recruitmentRoutes);
app.use('/api/v1/work-reports', workReportRoutes);
app.use('/api/v1/audit-logs', auditRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/expenses', require('./routes/expenseRoutes'));
app.use('/api/v1/helpdesk', require('./routes/helpdeskRoutes'));

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aayup_hrms';

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      
      const initScheduler = require('./jobs/scheduler');
      initScheduler();

      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB', err);
      process.exit(1);
    });
}

module.exports = app;
