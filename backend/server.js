require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://event-taupe-two.vercel.app",
];

connectDB().catch((err) => {
  console.error("DB connection failed", err);
  process.exit(1);
});
console.log(allowedOrigins, "allowed origins");
app.use(helmet());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
  })
);

app.options("*", cors());
app.use(express.json());

app.use(passport.initialize());
require("./middleware/passport")(passport);

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);
app.use("/upload", uploadRoutes);

app.get("/", (req, res) => res.send({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
