const express = require('express');
const router = express.Router();
const { getAllUsers, getUserBookings, deleteUser } = require('../controllers/userController');
const passport = require('passport');

// All routes require admin authentication
router.use(passport.authenticate('jwt', { session: false }));

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

router.get('/', requireAdmin, getAllUsers);
router.get('/:userId/bookings', requireAdmin, getUserBookings);
router.delete('/:userId', requireAdmin, deleteUser);

module.exports = router; 