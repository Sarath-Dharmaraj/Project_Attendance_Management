const mongoose = require('mongoose')
const RectifiedDB = new mongoose.Schema({
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
    rectification:{
        type: String,
        enum: ["present", "absent"],
        required: true
    }
},{
    timestamp: true
})

module.exports = mongoose.model('RectifiedDB', RectifiedDB);