const mongoose = require('mongoose')
const AuditLogDB = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true  
    }
},{
    timestamps: true
})

module.exports = mongoose.model('AuditLogDB', AuditLogDB);