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
// to sign in
// to get profile data
// to post profile data
// to put profile data
// to post attendance as emp/man
// to edit attendance as man/adm for emp
// to edit attendance as adm for man
// to sent rectification requests as emp


// Post Listener
const port = parseInt(process.env.PORT) || 5000;
app.listen(port, () => {
    console.info(`Server is running on port ${port}`)
})