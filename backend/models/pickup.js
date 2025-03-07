import mongoose from 'mongoose';

const pickupSchema = new mongoose.Schema({
    donor: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'dates_proposed', 'scheduled', 'qr_requested', 'qr_accepted', 'completed', 'cancelled'],
        default: 'pending'
    },
    quantity: {
        type: Number,
        required: true
    },
    wasteType: {
        type: String,
        required: true
    },
    itemType: {
        type: String,
        required: true
    },
    proposedDates: [{
        date: {
            type: Date,
            required: true
        },
        timeSlot: {
            type: String,
            required: true
        }
    }],
    confirmedDate: {
        date: Date,
        timeSlot: String
    },
    completedAt: Date,
    completedBy: String,
    additionalPoints: {
        type: Number,
        default: 0
    },
    completionNotes: String,
    qrRequestDetails: {
        requestedAt: Date,
        requestedBy: String,
        acceptedAt: Date,
        requestType: {
            type: String,
            enum: ['surplus_food', 'compost'],
            required: false
        }
    },
    qrCode: {
        generatedAt: Date,
        data: String
    },
    lastQrRequestTime: Date,
    qrRequestedBy: String,
    qrGenerationAttempts: {
        type: Number,
        default: 0
    },
    qrCodes: [{
        code: String,
        generatedAt: {
            type: Date,
            default: Date.now
        },
        expiresAt: Date,
        status: {
            type: String,
            enum: ['active', 'used', 'expired'],
            default: 'active'
        },
        scannedAt: Date,
        scannedBy: String
    }]
}, {
    timestamps: true
});

// Add indexes for better query performance
pickupSchema.index({ donor: 1, status: 1 });
pickupSchema.index({ receiver: 1, status: 1 });
pickupSchema.index({ 'confirmedDate.date': 1 });
pickupSchema.index({ 'proposedDates.date': 1 });
pickupSchema.index({ createdAt: -1 });

const Pickup = mongoose.model('Pickup', pickupSchema);
export default Pickup;