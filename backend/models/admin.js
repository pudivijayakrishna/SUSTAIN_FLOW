import mongoose from "mongoose";

const adminSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    lastAccess: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

// Add indexes for better query performance
adminSessionSchema.index({ sessionId: 1 }, { unique: true });
adminSessionSchema.index({ expiresAt: 1 });
adminSessionSchema.index({ lastAccess: -1 });

const AdminSession = mongoose.model('AdminSession', adminSessionSchema);
export default AdminSession;