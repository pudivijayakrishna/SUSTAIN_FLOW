import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    fromUser: {
        type: String,
        ref: 'User',
        required: true
    },
    toUser: {
        type: String,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

// Create indexes
feedbackSchema.index({ fromUser: 1, toUser: 1 });
feedbackSchema.index({ toUser: 1, createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback; 