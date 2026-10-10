const cron = require('node-cron');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');

const initScheduler = () => {
  // Run daily at 00:01 AM
  cron.schedule('1 0 * * *', async () => {
    console.log('Running daily background jobs...');
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const day = today.getDate();

      // Find birthdays today
      const birthdays = await Employee.find({
        status: 'Active',
        $expr: {
          $and: [
            { $eq: [{ $month: "$dateOfBirth" }, month] },
            { $eq: [{ $dayOfMonth: "$dateOfBirth" }, day] }
          ]
        }
      });

      if (birthdays.length > 0) {
        console.log(`Found ${birthdays.length} birthdays today.`);
        // In a real scenario, this would send an email via nodemailer
      }

      // Log the successful execution of the job
      await AuditLog.create({
        action: 'UPDATE',
        resource: 'Scheduler',
        details: { message: `Daily cron executed. Processed ${birthdays.length} birthdays.` },
        ipAddress: '127.0.0.1'
      });

    } catch (error) {
      console.error('Error executing daily cron job:', error);
    }
  });

  console.log('Scheduler initialized.');
};

module.exports = initScheduler;
