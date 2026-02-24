const mongoose = require('mongoose')
const AttendanceDB = new mongoose.Schema({
    userId:{
        type: String,
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
    attendance:{
        type: String,
        enum: ['present', 'absent'],
        required: true
    },
    rectified:{
        type: Boolean,
        default: false
    }
},{
    timestamp: true
})

module.exports = mongoose.model('AttendanceDB', AttendanceDB);