const Event = require('../models/Event');
const Booking = require('../models/Booking');

const createEvent = async (req, res) => {
  try {
    const { title, description, date, closingDate, location, capacity, price } = req.body;
    
    // Handle image upload - req.file.path contains the Cloudinary URL
    const image = req.file ? req.file.path : req.body.image;
    
    const event = new Event({ title, description, date, closingDate, location, capacity, price, image });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateEvent = async (req, res) => {
  try {
    // Handle image upload - req.file.path contains the Cloudinary URL
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path;
    }
    
    const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    await Booking.deleteMany({ event: event._id });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    
    // Calculate available seats and registration status for each event
    const eventsWithAvailability = await Promise.all(events.map(async (event) => {
      const agg = await Booking.aggregate([
        { $match: { event: event._id } },
        { $group: { _id: '$event', totalSeats: { $sum: '$seats' } } }
      ]);
      const bookedSeats = agg.length ? agg[0].totalSeats : 0;
      const availableSeats = event.capacity - bookedSeats;
      
      // Check if registration is still open
      const now = new Date();
      const isRegistrationOpen = now <= event.closingDate;
      
      return {
        ...event.toObject(),
        availableSeats,
        bookedSeats,
        isRegistrationOpen
      };
    }));
    
    res.json(eventsWithAvailability);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    // Calculate available seats for this event
    const agg = await Booking.aggregate([
      { $match: { event: event._id } },
      { $group: { _id: '$event', totalSeats: { $sum: '$seats' } } }
    ]);
    const bookedSeats = agg.length ? agg[0].totalSeats : 0;
    const availableSeats = event.capacity - bookedSeats;
    
    // Check if registration is still open
    const now = new Date();
    const isRegistrationOpen = now <= event.closingDate;
    
    const eventWithAvailability = {
      ...event.toObject(),
      availableSeats,
      bookedSeats,
      isRegistrationOpen
    };
    
    res.json(eventWithAvailability);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEventBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ event: req.params.id }).populate('user', 'name email');
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createEvent, updateEvent, deleteEvent, getEvents, getEvent, getEventBookings };