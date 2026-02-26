const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const LoginDB = require('./models/LoginDB');
const ProfileDB = require('./models/ProfileDB');
const AttendanceDB = require('./models/AttendanceDB');
const RectifiedDB = require('./models/RectifiedDB');
const AuditLogDB = require('./models/AuditLogDB');

const { auth, roleAuth } = require('./auth');

const app = express();
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// MongoDB Cloud Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.info("MongoDB is connected"))
  .catch((err) => console.error(`MongoDB connection error: ${err}`));

// --- AUTH ROUTES ---

app.post('/signup', async (req, res) => {
  try {
    const { userName, email, password, role, department } = req.body;
    const checkUser = await LoginDB.findOne({ $or: [{ email }, { userName }] });
    if (checkUser) return res.status(400).json({ message: 'Email or Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new LoginDB({ userName, email, password: hashedPassword });
    await newUser.save();

    const newProfile = new ProfileDB({ 
      userId: newUser._id,
      role: role || 'employee',
      department: department || 'Unassigned'
    });
    await newProfile.save();

    // NEW: Generate the token instantly upon registration!
    const token = jwt.sign({
      userId: newUser._id,
      userName: newUser.userName,
      role: newProfile.role,
      department: newProfile.department
    }, process.env.jwt_Secret, { expiresIn: '1h' });

    // NEW: Send the token back to the frontend
    return res.status(201).json({ message: 'User registered successfully', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/signin', async (req, res) => {
  try {
    const { identifier, password } = req.body; 
    const userData = await LoginDB.findOne({ $or: [{ email: identifier }, { userName: identifier }] });
    if (!userData) return res.status(400).json({ message: 'Credentials wrong' });

    const isPassword = await bcrypt.compare(password, userData.password);
    if (!isPassword) return res.status(400).json({ message: 'Credentials wrong' });

    const userProfile = await ProfileDB.findOne({ userId: userData._id });
    const token = jwt.sign({
      userId: userData._id,
      userName: userData.userName,
      role: userProfile.role,
      department: userProfile.department
    }, process.env.jwt_Secret, { expiresIn: '1h' });

    return res.status(200).json({ message: 'Login Successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- ATTENDANCE & RECTIFICATION ROUTES ---

app.post('/attendance/mark', auth, roleAuth(['employee', 'manager']), async (req, res) => {
  try {
    const { attendance } = req.body;
    const date = new Date().toISOString().slice(0, 10);
    const existing = await AttendanceDB.findOne({ userId: req.user.userId, date });
    if (existing) return res.status(409).json({ message: 'Already marked for today' });

    const mark = new AttendanceDB({ userId: req.user.userId, date, attendance, department: req.user.department, role: req.user.role });
    await mark.save();
    res.status(200).json({ message: 'Marked', status: attendance });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.put('/attendance/edit', auth, roleAuth(['manager', 'admin']), async (req, res) => {
  try {
    const { targetUserId, date, attendance } = req.body;
    await AttendanceDB.findOneAndUpdate(
      { userId: targetUserId, date },
      { $set: { attendance, rectified: true } },
      { upsert: true }
    );
    await RectifiedDB.findOneAndDelete({ userId: targetUserId, date });
    res.status(200).json({ message: 'Updated' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.get('/dashboard', auth, async (req, res) => {
  try {
    const { role, userId, department } = req.user;
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    let data = (role === 'employee') ? await AttendanceDB.find({ userId }) : (role === 'manager') ? await AttendanceDB.find({ department, date }) : await AttendanceDB.find({ date });
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.post('/rectification/:id', auth, async (req, res) => {
  try {
    const { date } = req.body;
    const att = await AttendanceDB.findOne({ userId: req.params.id, date });
    if (!att) return res.status(404).json({ message: 'Attendance not found' });

    const request = new RectifiedDB({
      userId: req.params.id, date, 
      attendance: att.attendance, 
      rectification: att.attendance === "present" ? "absent" : "present",
      department: req.user.department
    });
    await request.save();
    res.status(201).json({ message: 'Requested' });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.get('/rectifications', auth, async (req, res) => {
  try {
    const { role, userId, department } = req.user;
    const data = (role === 'employee') ? await RectifiedDB.find({ userId }) : (role === 'manager') ? await RectifiedDB.find({ department }) : await RectifiedDB.find();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.info(`Server on port ${port}`));