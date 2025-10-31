const mongoose = require('mongoose')
const AuditLogDB = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    role: {
        type: String,
    },
    department: {
        type: String,
    },
    description: {
        type: String,
        required: true  
    }
},{
    timestamps: true
})

module.exports = mongoose.model('AuditLogDB', AuditLogDB);