import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    receiver: {
        type: String,
        required: true
    },
    reward: {
        name: {
            type: String,
            required: true
        },
        point: {
            type: Number,
            required: true
        }
    },
    type: {
        type: String,
        enum: ['earn', 'redeem', 'ngo_donation', 'ngo_reward'],
        required: true,
        default: 'earn'
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add virtual field for formatted date
historySchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString();
});

// Add indexes for better query performance
historySchema.index({ sender: 1 });
historySchema.index({ receiver: 1 });
historySchema.index({ type: 1 });
historySchema.index({ date: -1 });
historySchema.index({ createdAt: -1 });

const History = mongoose.model('History', historySchema);
export default History;