const passport = require('passport');

const authenticate = passport.authenticate('jwt', { session: false });

const authorizeAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: admin only' });
  next();
};

module.exports = { authenticate, authorizeAdmin };