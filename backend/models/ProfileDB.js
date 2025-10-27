const mongoose = require('mongoose')
const ProfileDB = new mongoose.Schema({

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LoginDB',
        required: true
    },
    role:{
        type: String,
        required: true
    },
    department:{
        type: String,
        required: true
    },
    contact:{
        type: String,
        required: true
    },
    joinDate:{
        type: String,
        required: true
    },
    address:{
        country:{
            type: String,
            required: true
        },
        state:{
            type: String,
            required: true
        },
        city:{
            type: String,
            required: true
        },
        pinCode:{
            type: String,
            required: true
        }
    }
},{
    timestamps: true
})

module.exports = mongoose.model('ProfileDB', ProfileDB);