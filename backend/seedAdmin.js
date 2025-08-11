require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const seed = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = 'Admin';

  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
    process.exit(1);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists');
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);
  const admin = new User({ name, email, password: hash, role: 'admin' });
  await admin.save();
  console.log('Admin user created:', email);
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });