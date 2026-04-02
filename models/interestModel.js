const mongoose = require("mongoose");

const interestSchema = new mongoose.Schema({
    sender_email: { type: String, required: true },
    receiver_email: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'rejected'], 
        default: 'pending' 
    },
    created_at: { type: Date, default: Date.now }
});

// Ensure a user can only send one interest to another
interestSchema.index({ sender_email: 1, receiver_email: 1 }, { unique: true });

module.exports = mongoose.model("interests", interestSchema);
