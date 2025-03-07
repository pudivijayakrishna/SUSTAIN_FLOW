import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    adminUsername: {
        type: String,
        required: true
    },
    targetUsername: {
        type: String,
        required: true
    },
    targetUserRole: {
        type: String,
        enum: ['donor', 'ngo', 'compostAgency'],
        required: true
    },
    action: {
        type: String,
        enum: [
            'block',
            'unblock',
            'delete',
            'update',
            'verify_document',
            'reject_document',
            'view_document',
            'reset_password',
            'update_profile',
            'login_attempt',
            'verification_status_change'
        ],
        required: true
    },
    reason: {
        type: String,
        required: function() {
            return ['block', 'reject_document'].includes(this.action);
        }
    },
    details: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    previousState: mongoose.Schema.Types.Mixed,
    newState: mongoose.Schema.Types.Mixed,
    lastAction: {
        action: String,
        timestamp: Date,
        adminUsername: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add indexes for better query performance
activityLogSchema.index({ adminUsername: 1 });
activityLogSchema.index({ targetUsername: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ timestamp: -1 });

// Add virtual for formatted date
activityLogSchema.virtual('formattedDate').get(function() {
    return this.timestamp.toLocaleString();
});

// Add virtual for action color
activityLogSchema.virtual('actionColor').get(function() {
    switch(this.action) {
        case 'block':
            return 'error';
        case 'unblock':
            return 'success';
        case 'verify_document':
            return 'success';
        case 'reject_document':
            return 'error';
        default:
            return 'info';
    }
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog; 