const mongoose = require('mongoose')
const ProfileDB = new mongoose.Schema({

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LoginDB',
        required: true
    },
    role:{
        type: String,
        enum: ["employee", "manager", "admin"]
    },
    department:{
        type: String,
    },
    contact:{
        type: String,
    },
    joinDate:{
        type: String,
    },
    address:{
        country:{
            type: String,
        },
        state:{
            type: String,
        },
        city:{
            type: String,
        },
        pinCode:{
            type: String,
        }
    }
},{
    timestamps: true
})

module.exports = mongoose.model('ProfileDB', ProfileDB);