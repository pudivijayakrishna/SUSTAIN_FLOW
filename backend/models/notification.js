import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    targetUser: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['system', 'pickup', 'points', 'donation', 'reward', 'verification', 'supplies'],
        required: true,
        default: 'system'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    read: {
        type: Boolean,
        default: false
    },
    link: {
        type: String,
        default: null
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    }
}, { 
    timestamps: true 
});

// Add indexes for better query performance
notificationSchema.index({ targetUser: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;