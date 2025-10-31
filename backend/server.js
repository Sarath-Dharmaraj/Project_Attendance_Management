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

const app = express();

// middleware configuration
dotenv.config();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// connecting mongoDB
mongoose.connect(process.env.MONGODB_URI)
        .then(() => {console.info("MongoDB is connected")})
        .catch((err) => {(console.error(`MongoDB couldn't get connect ${err}`))});

// to sign up
app.post('/signup', async (req, res) => {
  try {
    const { userName, email, password } = req.body;

    const checkUser = await LoginDB.findOne({ email });
    if (checkUser) {
      return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new LoginDB({ userName, email, password: hashedPassword });
    await newUser.save();

    const newProfile = new ProfileDB({ userId: newUser._id });
    await newProfile.save();

    const auditLog = new AuditLogDB({userId: newUser._id, action: "New user Register", description: `New User ${userName} register and assigned _id ${newUser._id}`})
    await auditLog.save();

    return res.status(201).send('User registered and profile created successfully');
  } 
  catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
});
// to sign in
app.post('/signin', async (req, res) => {
  try{
    const { email, password} = req.body;
    const userData = await LoginDB.findOne({email});

    if(!userData) {
      return res.status(400).send({'login failed' : 'email or password is wrong'})
    }

    const isPassword = await bcrypt.compare(password, userData.password)
    if (!isPassword) {
      return res.status(400).send({'login failed' : 'email or password is wrong'})
    }

    const token = jwt.sign({
      userId: userData._id,
      userName: userData.userName,
      email: userData.email
    },
    process.env.jwt_Secret, 
    { expiresIn: '1h' }
  )

  const auditLog = new AuditLogDB({userId: userData._id, action: "Login", description: `user ${userData.userName} Logged in at ${new Date().toISOString()}`})
  await auditLog.save();

  return res.status(201).send({
    message: 'Login Successful',
    token
    }
  );
  }
  catch(err){
    console.error(err);
    return res.status(500).send('Server error');
  }
})
// to get profile data
app.get('/profile/:id',async (req, res) => {
  try{
    const userId = req.params.id;
    const userProfile = await ProfileDB.findOne({userId});

    if(!userProfile){
      return res.status(404).send('User Profile Not Found!');
    }

    return res.status(200).json({
      message: 'User profile extracted',
      profile: userProfile
    });
  } 
  catch(err){
    console.error(err);
    return res.status(500).send('Server error');
  }
})
// to post profile data
app.post('/profile/:id', async (req, res) => {
  try {
  const userId = req.params.id;
  const {
    role,
    department,
    contact,
    joinDate,
    country,
    state,
    city,
    pinCode
  } = req.body;

  const userProfile = await ProfileDB.findOne({ userId });
  if (userProfile) {
    return res.status(400).send('User profile already exits!');
  }

  const creatingProfile = new ProfileDB(
    {
        userId: userId,
        role: role || userProfile.role,
        department: department || userProfile.department,
        contact: contact || userProfile.contact,
        joinDate: joinDate || userProfile.joinDate,
        'address.country': country || userProfile.address.country,
        'address.state': state || userProfile.address.state,
        'address.city': city || userProfile.address.city,
        'address.pinCode': pinCode || userProfile.address.pinCode
    }
  );

  await creatingProfile.save();

  const checkUser = await LoginDB.findById(userId);

  const auditLog = new AuditLogDB({userId: userId, action: "Profile created", description: `Profile of User ${checkUser.userName} has been created.\n User Profile :\n ${JSON.stringify(req.body, null, 2)}`})
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
})
// to put profile data
app.put('/profile/:id', async (req, res) => {
  try {
  const userId = req.params.id;
  const {
    role,
    department,
    contact,
    joinDate,
    country,
    state,
    city,
    pinCode
  } = req.body;

  const userProfile = await ProfileDB.findOne({ userId }).populate('userId');
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

  const auditLog = new AuditLogDB({userId: userId, action: "Profile updated", description: `Profile of User ${userProfile.userId.userName} has been updated.\n Updated Data :\n ${JSON.stringify(req.body, null, 2)}`})
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
})

// to post attendance as emp/man
app.post('/attendance/:id', async (req, res) => {
  try{
    const {userId} = req.params.id;
    const 
  }
  catch (err){
    console.error(err);
    return res.status(500).send('Server error');
  }
})
// to edit attendance as man/adm for emp
// to edit attendance as adm for man
// to sent rectification requests as emp

// home
app.get('/', async(req,res) => {
    res.json('it is home page')
})
// Post Listener
const port = parseInt(process.env.PORT) || 5000;
app.listen(port, () => {
    console.info(`Server is running on port ${port}`)
})