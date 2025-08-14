const express = require('express');
const router = express.Router();
const {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvents,
  getEvent,
  getEventBookings
} = require('../controllers/eventController');

const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/', getEvents);
router.get('/:id', getEvent);

router.post('/', authenticate, authorizeAdmin, upload.single('image'), createEvent);
router.put('/:id', authenticate, authorizeAdmin, upload.single('image'), updateEvent);
router.delete('/:id', authenticate, authorizeAdmin, deleteEvent);

router.get('/:id/bookings', authenticate, authorizeAdmin, getEventBookings);

module.exports = router;