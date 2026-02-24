// Exporting required packages and models
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

// middleware configuration
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// connecting mongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.info("MongoDB is connected") })
  .catch((err) => { (console.error(`MongoDB couldn't get connect ${err}`)) });

// to sign up
app.post('/signup', async (req, res) => {
  try {
    // Now extracting role and department from the frontend request
    const { userName, email, password, role, department } = req.body;

    // Check if email OR username already exists
    const checkUser = await LoginDB.findOne({ $or: [{ email }, { userName }] });
    if (checkUser) {
      return res.status(400).json({ message: 'Email or Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new LoginDB({ userName, email, password: hashedPassword });
    await newUser.save();

    // Save the role and department to the profile immediately
    const newProfile = new ProfileDB({ 
      userId: newUser._id,
      role: role || 'employee',
      department: department || 'Unassigned'
    });
    await newProfile.save();

    const auditLog = new AuditLogDB({ 
      userId: newUser._id, 
      action: "New user Register", 
      description: `New User ${userName} registered as ${role} in ${department}` 
    });
    await auditLog.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } 
  catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// to sign in
app.post('/signin', async (req, res) => {
  try {
    // 'identifier' will hold either the email or the username
    const { identifier, password } = req.body; 
    
    // Find user by email OR username
    const userData = await LoginDB.findOne({
      $or: [{ email: identifier }, { userName: identifier }]
    });

    if (!userData) {
      return res.status(400).json({ message: 'Email/Username or password is wrong' });
    }

    const isPassword = await bcrypt.compare(password, userData.password);
    if (!isPassword) {
      return res.status(400).json({ message: 'Email/Username or password is wrong' });
    }

    const userProfile = await ProfileDB.findOne({ userId: userData._id }).select('role department');
    
    const token = jwt.sign({
      userId: userData._id,
      userName: userData.userName,
      email: userData.email,
      role: userProfile.role,
      department: userProfile.department
    },
      process.env.jwt_Secret, 
      { expiresIn: '1h' }
    );

    const auditLog = new AuditLogDB({ 
      userId: userData._id, 
      action: "Login", 
      description: `user ${userData.userName} Logged in` 
    });
    await auditLog.save();

    return res.status(200).json({
      message: 'Login Successful',
      token
    });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// to get profile data
app.get('/profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const userProfile = await ProfileDB.findOne({ userId });

    if (!userProfile) {
      return res.status(404).send('User Profile Not Found!');
    }

    return res.status(200).json({
      message: 'User profile extracted',
      profile: userProfile
    });
  }
  catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
});

// to post profile data
app.post('/profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      role, department, contact, joinDate, country, state, city, pinCode
    } = req.body;

    const userProfile = await ProfileDB.findOne({ userId });
    if (userProfile) {
      return res.status(400).send('User profile already exits!');
    }

    const creatingProfile = new ProfileDB({
      userId: userId,
      role: role || userProfile.role,
      department: department || userProfile.department,
      contact: contact || userProfile.contact,
      joinDate: joinDate || userProfile.joinDate,
      'address.country': country || userProfile.address.country,
      'address.state': state || userProfile.address.state,
      'address.city': city || userProfile.address.city,
      'address.pinCode': pinCode || userProfile.address.pinCode
    });

    await creatingProfile.save();

    const checkUser = await LoginDB.findById(userId);

    const auditLog = new AuditLogDB({ userId: userId, action: "Profile created", description: `Profile of User ${checkUser.userName} has been created.\n User Profile :\n ${JSON.stringify(req.body, null, 2)}` })
    await auditLog.save();

    return res.status(201).json({
      message: 'Profile created successfully',
      profile: creatingProfile
    });
  }
  catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
});

// to put profile data
app.put('/profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      role, department, contact, joinDate, country, state, city, pinCode
    } = req.body;

    const userProfile = await ProfileDB.findOne({ userId }).populate({ path: 'userId', select: 'userName' });
    if (!userProfile) {
      return res.status(404).send('User Profile Not Found!');
    }

    const updatedProfile = await ProfileDB.findOneAndUpdate(
      { userId },
      {
        $set: {
          role: role || userProfile.role,
          department: department || userProfile.department,
          contact: contact || userProfile.contact,
          joinDate: joinDate || userProfile.joinDate,
          'address.country': country || userProfile.address.country,
          'address.state': state || userProfile.address.state,
          'address.city': city || userProfile.address.city,
          'address.pinCode': pinCode || userProfile.address.pinCode
        }
      },
      { new: true }
    );

    const auditLog = new AuditLogDB({ userId: userId, action: "Profile updated", description: `Profile of User ${userProfile.userId.userName} has been updated.\n Updated Data :\n ${JSON.stringify(req.body, null, 2)}` })
    await auditLog.save();

    return res.status(200).json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  }
  catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
});

// Mark Own Attendance (Employee & Manager only)
app.post('/attendance/mark', auth, roleAuth(['employee', 'manager']), async (req, res) => {
  try {
    const { attendance } = req.body;
    const userId = req.user.userId;
    const date = new Date().toISOString().slice(0, 10);

    const existingAttendance = await AttendanceDB.findOne({ userId, date });
    if (existingAttendance) {
      return res.status(409).json({ message: 'Attendance already marked for today. Request rectification if needed.' });
    }

    const markAttendance = new AttendanceDB({
      userId,
      date,
      department: req.user.department,
      role: req.user.role,
      attendance
    });

    await markAttendance.save();

    await AuditLogDB.create({
      userId,
      action: "Marked Attendance",
      role: req.user.role,
      department: req.user.department,
      description: `${req.user.userName} marked themselves ${attendance} on ${date}`
    });

    return res.status(200).json({ message: 'Attendance marked successfully', status: attendance });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
});

// Edit or Mark Employee Attendance (Manager & Admin)
// Edit or Mark Employee Attendance (Manager & Admin)
app.put('/attendance/edit', auth, roleAuth(['manager', 'admin']), async (req, res) => {
  try {
    const { targetUserId, date, attendance } = req.body;

    const targetProfile = await ProfileDB.findOne({ userId: targetUserId });
    if (!targetProfile) return res.status(404).json({ message: 'Target user profile not found' });

    if (req.user.role === 'manager') {
      if (targetProfile.department !== req.user.department) {
        return res.status(403).json({ message: 'Forbidden: You can only edit attendance for your sector.' });
      }
      if (targetProfile.role !== 'employee') {
        return res.status(403).json({ message: 'Forbidden: Managers can only edit employee attendance.' });
      }
    }

    const updatedAttendance = await AttendanceDB.findOneAndUpdate(
      { userId: targetUserId, date },
      {
        $set: {
          department: targetProfile.department,
          role: targetProfile.role,
          attendance: attendance,
          rectified: true
        }
      },
      { new: true, upsert: true }
    );

    // FIX: Delete the rectification request from the database since it's approved!
    await RectifiedDB.findOneAndDelete({ userId: targetUserId, date: date });

    await AuditLogDB.create({
      userId: req.user.userId,
      action: "Attendance Edited",
      description: `${req.user.role} (${req.user.userName}) set attendance to ${attendance} for user ${targetUserId} on ${date}`
    });

    return res.status(200).json({ message: 'Attendance successfully updated', data: updatedAttendance });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
});

// Unified Dashboard Route
app.get('/dashboard', auth, async (req, res) => {
  try {
    const { role, userId, department } = req.user;
    const queryDate = req.query.date || new Date().toISOString().slice(0, 10);

    let dashboardData;

    if (role === 'employee') {
      dashboardData = await AttendanceDB.find({ userId }).sort({ date: -1 });
    }
    else if (role === 'manager') {
      dashboardData = await AttendanceDB.find({ department, date: queryDate });
    }
    else if (role === 'admin') {
      dashboardData = await AttendanceDB.find({ date: queryDate });
    }

    return res.status(200).json({
      message: `${role} dashboard loaded successfully`,
      data: dashboardData
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
});

// to sent rectification requests as emp
app.post('/rectification/:id', auth, roleAuth(['employee', 'manager']), async (req, res) => {
  try {
    const userId = req.params.id;
    const { date } = req.body;
    const existingRequest = await RectifiedDB.findOne({ userId, date });
    if (existingRequest) {
      return res.status(409).json({ message: 'Rectification request already exists for this date' });
    }
    const profile = await ProfileDB.findOne({ userId }).select('department role');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    const { department, role } = profile;

    const attendanceCheck = await AttendanceDB.findOne({ userId, date }).select('attendance');
    if (!attendanceCheck) {
      return res.status(404).json({ message: 'Attendance not found for the given date' });
    }
    const { attendance } = attendanceCheck;
    const rectification = (attendance === "present") ? "absent" : "present";

    const addRequest = new RectifiedDB({
      userId,
      date,
      department,
      role,
      attendance,
      rectification
    });

    await addRequest.save();

    const userProfile = await LoginDB.findById(userId).select('userName');
    const auditLog = new AuditLogDB({
      userId,
      action: "Rectification Request",
      role,
      department,
      description: `${userProfile.userName} has requested attendance rectification for ${date}`
    });

    await auditLog.save();

    return res.status(201).json({
      message: 'Request Added',
      status: 'successful',
      updated: addRequest
    });
  }
  catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
});

app.get('/rectifications', auth, async (req, res) => {
  try {
    const { role, userId, department } = req.user;
    let requests;

    if (role === 'employee') {
      // Employee only gets their own requests
      requests = await RectifiedDB.find({ userId });
    } else if (role === 'manager') {
      // Manager gets their whole department
      requests = await RectifiedDB.find({ department });
    } else if (role === 'admin') {
      // Admin gets everything
      requests = await RectifiedDB.find();
    }

    return res.status(200).json(requests);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
});

// home
app.get('/', async (req, res) => {
  res.json('it is home page');
});

// Post Listener
const port = parseInt(process.env.PORT) || 5000;
app.listen(port, () => {
  console.info(`Server is running on port ${port}`);
});