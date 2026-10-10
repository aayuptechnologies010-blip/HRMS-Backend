const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: { message: 'Not authorized to access this route' } });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aayup_hrms_super_secret_key');
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ success: false, error: { message: 'User no longer exists' } });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: { message: 'Not authorized to access this route' } });
  }
};
