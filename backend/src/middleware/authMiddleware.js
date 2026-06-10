const jwt = require('jsonwebtoken');

/**
 * Verifies the Bearer JWT in the Authorization header.
 * Attaches the decoded payload to req.user.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 * Requires the authenticated user to have the 'admin' role.
 * Must be used after authenticate middleware.
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
