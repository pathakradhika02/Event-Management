const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
        trim: true
    },
    eventDate: {
        type: Date,
        required: true,
        trim: true
    },
    createdBy: {
        type: ObjectId,
        ref: "user",
        required: true,
        trim: true,
    },
    invitees: {
        _id: false,
        type: [{
            invitee: {
                type: ObjectId,
                ref: "user"
            }, 
            invitedAt: Date
        }]
    }
}, { timestamps: true });

module.exports = mongoose.model('event', eventSchema)