const AuditLog = require('../models/AuditLog');

/**
 * Middleware to log sensitive actions to the database.
 * 
 * @param {String} resource - The resource being affected (e.g., 'Employee', 'Payroll')
 * @returns Express Middleware
 */
const logAction = () => {
  return async (req, res, next) => {
    const resource = req.originalUrl;
    
    // Determine action based on HTTP method
    let action = 'UPDATE';
    if (req.method === 'POST') action = 'CREATE';
    if (req.method === 'DELETE') action = 'DELETE';
    
    // We override res.send or res.json to capture the response status
    const originalJson = res.json;
    
    res.json = function (body) {
      // Only log successful mutating actions
      if (res.statusCode >= 200 && res.statusCode < 300) {
        
        let resourceId = req.params.id || null;
        if (req.method === 'POST' && body && body.data && body.data._id) {
          resourceId = body.data._id.toString();
        }

        const logEntry = new AuditLog({
          userId: req.user ? req.user.id : null,
          action,
          resource,
          resourceId,
          details: req.body ? JSON.stringify(req.body) : null,
          ipAddress: req.ip || req.connection.remoteAddress
        });

        // Fire and forget
        logEntry.save().catch(err => console.error('Failed to save audit log', err));
      }
      
      // Call original json method
      originalJson.call(this, body);
    };

    next();
  };
};

module.exports = { logAction };
