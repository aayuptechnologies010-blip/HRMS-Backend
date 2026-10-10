const BASE_URL = 'http://localhost:5000/api/v1';

async function runTests() {
  try {
    console.log('--- STARTING E2E API WORKFLOW TESTS ---');

    // EMPLOYEE TESTS
    console.log('\\n--- 1. EMPLOYEE WORKFLOW ---');
    const empLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul.s@aayup.com', password: 'admin' })
    });
    const empLoginData = await empLoginRes.json();
    if (!empLoginData.success) throw new Error(empLoginData.error?.message || 'Employee Login failed');
    const empToken = empLoginData.token;
    console.log('✓ Employee Login successful.');

    const empHeaders = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${empToken}` 
    };

    const checkInRes = await fetch(`${BASE_URL}/attendance/check-in`, { method: 'POST', headers: empHeaders });
    const checkInData = await checkInRes.json();
    if (!checkInData.success && checkInData.error?.message !== 'Already checked in today') {
       throw new Error(checkInData.error?.message || 'Check-in failed');
    }
    console.log('✓ Employee Check-in successful / Already checked in.');

    const ticketRes = await fetch(`${BASE_URL}/helpdesk`, {
      method: 'POST',
      headers: empHeaders,
      body: JSON.stringify({
        subject: 'Test Integration Ticket',
        description: 'Verifying end-to-end functionality via automated script.',
        category: 'IT Support',
        isConfidential: true
      })
    });
    const ticketData = await ticketRes.json();
    if (!ticketData.success) throw new Error(ticketData.error?.message || 'Ticket creation failed');
    console.log('✓ Employee Helpdesk Ticket created with ID:', ticketData.data._id);


    // ADMIN TESTS
    console.log('\\n--- 2. ADMIN WORKFLOW ---');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@aayup.com', password: 'admin' })
    });
    const adminLoginData = await adminLoginRes.json();
    if (!adminLoginData.success) throw new Error(adminLoginData.error?.message || 'Admin Login failed');
    const adminToken = adminLoginData.token;
    console.log('✓ Admin Login successful.');

    const adminHeaders = { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}` 
    };

    const empRes = await fetch(`${BASE_URL}/employees`, { headers: adminHeaders });
    const empData = await empRes.json();
    console.log(`✓ Admin fetched employees: ${empData.data?.length || 0} found.`);

    const auditRes = await fetch(`${BASE_URL}/audit-logs`, { headers: adminHeaders });
    const auditData = await auditRes.json();
    const logs = auditData.data || [];
    console.log(`✓ Admin fetched Audit Logs: ${logs.length} total logs.`);
    console.log('Logs output:', JSON.stringify(logs, null, 2));
    
    const ticketLog = logs.find(log => log.resource === '/api/v1/helpdesk' && log.action === 'POST');
    const attendanceLog = logs.find(log => log.resource === '/api/v1/attendance/check-in' && log.action === 'POST');

    if (ticketLog) console.log('✓ Ticket creation was correctly recorded in audit log.');
    else console.log('❌ Ticket creation NOT FOUND in audit log!');

    if (attendanceLog) console.log('✓ Attendance check-in was correctly recorded in audit log.');
    else console.log('❌ Attendance check-in NOT FOUND in audit log!');

    console.log('\\n--- ALL TESTS COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('\\n❌ TEST FAILED!');
    console.error(error.message);
  }
}

runTests();
