const Booking = require('../models/Booking');
const Event = require('../models/Event');

const createBooking = async (req, res) => {
  try {
    const userId = req.user._id;
    const { eventId, seats = 1 } = req.body;
    if (!eventId) return res.status(400).json({ message: 'eventId required' });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if registration is still open
    const now = new Date();
    if (now > event.closingDate) {
      return res.status(400).json({ message: 'Registration for this event has closed' });
    }

    const agg = await Booking.aggregate([
      { $match: { event: event._id } },
      { $group: { _id: '$event', totalSeats: { $sum: '$seats' } } }
    ]);
    const bookedSeats = agg.length ? agg[0].totalSeats : 0;
    if (bookedSeats + seats > event.capacity) {
      return res.status(400).json({ message: 'Not enough seats available' });
    }

    const booking = new Booking({ user: userId, event: event._id, seats });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('event');
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createBooking, getMyBookings };