require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const allowedOrigins = [
  "http://localhost:5173", // Local dev
  "https://event-taupe-two.vercel.app", // Your main Vercel domain
  "https://event-git-main-vishnus-projects-330ea5ac.vercel.app" // Preview build
];
connectDB().catch(err => { console.error('DB connection failed', err); process.exit(1); });

app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());

app.use(passport.initialize());
require('./middleware/passport')(passport);

app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/bookings', bookingRoutes);
app.use('/users', userRoutes);

app.get('/', (req, res) => res.send({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));