const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('./models/Employee');
const Department = require('./models/Department');
const Lead = require('./models/Lead');
const User = require('./models/User');
const SalaryStructure = require('./models/SalaryStructure');
const PayrollRun = require('./models/PayrollRun');
const Payslip = require('./models/Payslip');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/aayup_hrms';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Employee.deleteMany({});
    await Department.deleteMany({});
    await User.deleteMany({});
    await SalaryStructure.deleteMany({});
    await PayrollRun.deleteMany({});
    await Payslip.deleteMany({});
    
    // Create Department
    const devDept = await Department.create({
      name: 'Development',
      description: 'Software Engineering Team'
    });
    
    const hrDept = await Department.create({
      name: 'HR & Admin',
      description: 'Human Resources'
    });
    
    // Create Users (for authentication)
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@aayup.com',
      password: 'admin', // Kept simple for MVP
      role: 'Super Admin'
    });

    const hrUser = await User.create({
      name: 'HR Manager',
      email: 'hr@aayup.com',
      password: 'admin',
      role: 'HR Manager'
    });

    const empUser = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul.s@aayup.com',
      password: 'admin',
      role: 'Employee'
    });

    // Create Employees
    const emp1 = await Employee.create({
      userId: empUser._id,
      employeeIdString: 'EMP-001',
      firstName: 'Rahul',
      lastName: 'Sharma',
      email: 'rahul.s@aayup.com',
      phone: '+91 98765 43210',
      departmentId: devDept._id,
      designation: 'React Developer',
      joiningDate: new Date('2025-01-15'),
      status: 'Active'
    });
    
    const emp2 = await Employee.create({
      userId: hrUser._id,
      employeeIdString: 'EMP-002',
      firstName: 'Priya',
      lastName: 'Singh',
      email: 'priya.s@aayup.com',
      phone: '+91 98765 43211',
      departmentId: hrDept._id,
      designation: 'HR Manager',
      joiningDate: new Date('2024-06-01'),
      status: 'Active'
    });

    // Create Salary Structures
    await SalaryStructure.create([
      {
        employeeId: emp1._id,
        effectiveDate: new Date('2026-01-01'),
        basicSalary: 60000,
        allowances: { hra: 24000, conveyance: 2000, medical: 1500, special: 2500 },
        deductions: { pf: 7200, tax: 5000, other: 0 },
        grossSalary: 90000,
        netPay: 77800,
        isActive: true
      },
      {
        employeeId: emp2._id,
        effectiveDate: new Date('2026-01-01'),
        basicSalary: 80000,
        allowances: { hra: 32000, conveyance: 2000, medical: 1500, special: 4500 },
        deductions: { pf: 9600, tax: 8000, other: 0 },
        grossSalary: 120000,
        netPay: 102400,
        isActive: true
      }
    ]);

    const Project = require('./models/Project');
    const Task = require('./models/Task');
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Lead.deleteMany({});

    const proj1 = await Project.create({
      name: 'Sales CRM',
      client: 'Internal',
      ownerId: emp1._id,
      status: 'Active'
    });

    await Task.create([
      {
        title: 'API Integration - CRM',
        projectId: proj1._id,
        assigneeId: emp1._id,
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date('2026-10-15')
      },
      {
        title: 'HRMS Onboarding Flow',
        projectId: proj1._id,
        assigneeId: emp2._id,
        status: 'Completed',
        priority: 'Medium',
        dueDate: new Date('2026-10-10')
      }
    ]);
    
    await Lead.create([
      { client: 'TechCorp Solutions', source: 'Website', ownerId: emp1._id, stage: 'Proposal', expectedValue: 12000, nextFollowUpDate: new Date('2026-10-15') },
      { client: 'Global Retailers Inc', source: 'LinkedIn', ownerId: emp2._id, stage: 'Negotiation', expectedValue: 25000, nextFollowUpDate: new Date('2026-10-11') },
      { client: 'NextGen Startups', source: 'Referral', ownerId: emp1._id, stage: 'Contacted', expectedValue: 5500, nextFollowUpDate: new Date('2026-10-12') },
      { client: 'HealthPlus Clinics', source: 'Cold Call', ownerId: emp2._id, stage: 'Won', expectedValue: 18000 }
    ]);
    
    console.log('Dummy data inserted successfully!');
    process.exit();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
