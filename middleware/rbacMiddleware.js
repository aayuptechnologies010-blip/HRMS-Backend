// RBAC Middleware

const permissions = {
  'Super Admin': ['*'],
  'HR Manager': [
    'create:employee', 'read:employee', 'update:employee', 'archive:employee',
    'read:department', 'create:department', 'update:department',
    'read:attendance', 'update:attendance',
    'create:leave', 'read:leave', 'approve:leave',
    'create:document', 'read:document', 'delete:document',
    'read:performance', 'create:performance',
    'read:helpdesk', 'update:helpdesk'
  ],
  'Accounts / Payroll': [
    'read:employee',
    'read:attendance',
    'read:leave',
    'create:payroll', 'read:payroll', 'update:payroll', 'approve:payroll'
  ],
  'Department Manager': [
    'read:employee',
    'read:attendance',
    'read:leave', 'approve:leave',
    'create:task', 'read:task', 'update:task', 'assign:task',
    'create:project', 'read:project', 'update:project',
    'read:performance', 'create:performance'
  ],
  'Team Leader / Reporting Manager': [
    'read:employee',
    'read:attendance',
    'read:leave', 'approve:leave',
    'create:task', 'read:task', 'update:task', 'assign:task',
    'read:project'
  ],
  'Sales Manager': [
    'read:employee',
    'create:lead', 'read:lead', 'update:lead', 'assign:lead',
    'read:task', 'update:task'
  ],
  'Employee': [
    'read:own_profile', 'update:own_profile',
    'read:own_attendance', 'create:own_attendance',
    'create:leave', 'read:leave',
    'read:task', 'update:own_task',
    'read:own_payroll',
    'read:own_document',
    'create:helpdesk', 'read:helpdesk'
  ]
};

exports.checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;
      
      if (!userRole || !permissions[userRole]) {
        return res.status(403).json({ success: false, error: { message: 'Forbidden: Unknown role' } });
      }

      // Super Admin has all permissions
      if (permissions[userRole].includes('*')) {
        return next();
      }

      // Check if user has the specific permission
      if (permissions[userRole].includes(requiredPermission)) {
        return next();
      }

      return res.status(403).json({ success: false, error: { message: `Forbidden: Missing required permission [${requiredPermission}]` } });
    } catch (error) {
      return res.status(500).json({ success: false, error: { message: 'Authorization error' } });
    }
  };
};
