const mongoose = require('mongoose')
const AttendanceDB = new mongoose.Schema({
    userID:{
        type: Object,
        required: true
    },
    date:{
        type: String,
        required: true
    },
    department:{
        type: String,
        required: true
    },
    role:{
        type: String,
        required: true
    },
    Attendance:{
        type: String,
        enum: ['present', 'absent'],
        required: true
    },
    rectifed:{
        type: String,
        enum: ["true", "false"],
        default: "false"
    }
},{
    timestamp: true
})

module.exports = mongoose.model('AttendanceDB', AttendanceDB);