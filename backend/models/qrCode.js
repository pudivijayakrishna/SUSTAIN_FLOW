import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema({
    pickup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pickup',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'used', 'expired'],
        default: 'active'
    },
    scannedAt: Date,
    scannedBy: String
}, {
    timestamps: true
});

// Add indexes for better query performance
qrCodeSchema.index({ status: 1, expiresAt: 1 });
qrCodeSchema.index({ pickup: 1 });
qrCodeSchema.index({ code: 1 }, { unique: true });

const QRCode = mongoose.model('QRCode', qrCodeSchema);
export default QRCode;