const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const PayrollRun = require('../models/PayrollRun');
const Payslip = require('../models/Payslip');
const SalaryStructure = require('../models/SalaryStructure');

let mongoServer;
let adminToken, empToken, adminUser, empUser, empRecord;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Employee.deleteMany({});
  await Department.deleteMany({});
  await PayrollRun.deleteMany({});
  await Payslip.deleteMany({});
  await SalaryStructure.deleteMany({});
  
  // Seed Users
  adminUser = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'password', role: 'Super Admin' });
  empUser = await User.create({ name: 'Emp', email: 'emp@test.com', password: 'password', role: 'Employee' });

  // Get tokens
  let res = await request(app).post('/api/v1/auth/login').send({ email: 'admin@test.com', password: 'password' });
  adminToken = res.body.token;

  res = await request(app).post('/api/v1/auth/login').send({ email: 'emp@test.com', password: 'password' });
  empToken = res.body.token;

  const dept = await Department.create({ name: 'Engineering', description: 'Eng' });

  empRecord = await Employee.create({
    userId: empUser._id,
    employeeIdString: 'EMP-T1',
    firstName: 'Test',
    lastName: 'Employee',
    email: 'emp@test.com',
    phone: '123456',
    departmentId: dept._id,
    designation: 'Dev',
    joiningDate: new Date(),
    status: 'Active'
  });

  await SalaryStructure.create({
    employeeId: empRecord._id,
    effectiveDate: new Date(),
    basicSalary: 50000,
    allowances: { hra: 10000, conveyance: 0, medical: 0, special: 0 },
    deductions: { pf: 5000, tax: 2000, other: 0 },
    grossSalary: 60000,
    netPay: 53000,
    isActive: true
  });
});

describe('Payroll API', () => {

  it('should allow Admin to generate payroll draft', async () => {
    const res = await request(app)
      .post('/api/v1/payroll/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ month: 10, year: 2026 });
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('Draft');
  });

  it('should prevent Employee from generating payroll', async () => {
    const res = await request(app)
      .post('/api/v1/payroll/generate')
      .set('Authorization', `Bearer ${empToken}`)
      .send({ month: 10, year: 2026 });
      
    expect(res.statusCode).toEqual(403);
  });

  it('should enforce payment confirmation before marking as Paid', async () => {
    const run = await PayrollRun.create({
      month: 11, year: 2026, status: 'Approved', employeeCount: 1, totalGross: 60000, totalNet: 53000,
      records: [{ employeeId: empRecord._id, grossSalary: 60000, netPay: 53000, deductions: 7000, additions: 0 }]
    });

    const res = await request(app)
      .put(`/api/v1/payroll/runs/${run._id}/pay`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({}); // Missing payment confirmation
      
    expect(res.statusCode).toEqual(400);
    expect(res.body.error.message).toMatch(/confirmation/i);
  });

  it('should only fetch published payslips for the logged-in employee', async () => {
    // Generate published payslip
    await Payslip.create({
      employeeId: empRecord._id,
      payrollRunId: new mongoose.Types.ObjectId(),
      month: 9,
      year: 2026,
      grossSalary: 60000,
      netPay: 53000,
      status: 'Published'
    });

    // Generate draft payslip (shouldn't exist according to rules, but just testing filtering)
    await Payslip.create({
      employeeId: empRecord._id,
      payrollRunId: new mongoose.Types.ObjectId(),
      month: 8,
      year: 2026,
      grossSalary: 60000,
      netPay: 53000,
      status: 'Hidden'
    });

    const res = await request(app)
      .get('/api/v1/payroll/my-payslips')
      .set('Authorization', `Bearer ${empToken}`);
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].status).toBe('Published');
    expect(res.body.data[0].month).toBe(9);
  });
  
});
