const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Employee = require('../models/Employee');
const LeaveRequest = require('../models/LeaveRequest');

let mongoServer;
let adminToken, empToken, empRecord, adminRecord;

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
  await LeaveRequest.deleteMany({});
  
  const adminUser = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'password', role: 'Super Admin' });
  const empUser = await User.create({ name: 'Emp', email: 'emp@test.com', password: 'password', role: 'Employee' });

  let res = await request(app).post('/api/v1/auth/login').send({ email: 'admin@test.com', password: 'password' });
  adminToken = res.body.token;

  res = await request(app).post('/api/v1/auth/login').send({ email: 'emp@test.com', password: 'password' });
  empToken = res.body.token;

  adminRecord = await Employee.create({ userId: adminUser._id, employeeIdString: 'ADMIN', firstName: 'Admin', lastName: 'User', email: 'admin@test.com', phone: '0', designation: 'Admin', joiningDate: new Date(), status: 'Active' });
  empRecord = await Employee.create({ userId: empUser._id, employeeIdString: 'EMP', firstName: 'Test', lastName: 'User', email: 'emp@test.com', phone: '0', designation: 'Dev', joiningDate: new Date(), status: 'Active' });
});

describe('Leave API', () => {

  it('should block overlapping leave requests', async () => {
    // Create first request
    await LeaveRequest.create({
      employeeId: empRecord._id,
      leaveType: 'Sick Leave (SL)',
      startDate: new Date('2026-10-15'),
      endDate: new Date('2026-10-20'),
      reason: 'Sick',
      status: 'Approved'
    });

    // Attempt overlapping request
    const res = await request(app)
      .post('/api/v1/leaves')
      .set('Authorization', `Bearer ${empToken}`)
      .send({
        employeeId: empRecord._id,
        leaveType: 'Casual Leave (CL)',
        startDate: new Date('2026-10-18'), // Overlaps
        endDate: new Date('2026-10-22'),
        reason: 'Vacation'
      });
      
    expect(res.statusCode).toEqual(400);
    expect(res.body.error.message).toMatch(/overlap/i);
  });

  it('should prevent employee from approving their own leave', async () => {
    const leave = await LeaveRequest.create({
      employeeId: empRecord._id,
      leaveType: 'Sick Leave (SL)',
      startDate: new Date('2026-11-01'),
      endDate: new Date('2026-11-02'),
      reason: 'Sick',
      status: 'Pending'
    });

    // Employee tries to approve their own request
    const res = await request(app)
      .put(`/api/v1/leaves/${leave._id}/approve`)
      .set('Authorization', `Bearer ${empToken}`)
      .send({ decision: 'approve' });
      
    // Because they are an Employee, RBAC (checkPermission('approve:leave')) will block them first with a 403
    expect(res.statusCode).toEqual(403);
  });

  it('should allow admin to approve leave', async () => {
    const leave = await LeaveRequest.create({
      employeeId: empRecord._id,
      leaveType: 'Sick Leave (SL)',
      startDate: new Date('2026-11-01'),
      endDate: new Date('2026-11-02'),
      reason: 'Sick',
      status: 'Pending'
    });

    // Admin tries to approve employee request
    const res = await request(app)
      .put(`/api/v1/leaves/${leave._id}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ decision: 'approve' });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.status).toBe('Approved');
  });
});
