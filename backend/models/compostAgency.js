import mongoose from "mongoose";

const agencyScehma = new mongoose.Schema({
    reward: [
        {
            name: {
                type: String,
                required: true
            },
            point: {
                type: Number,
                required: true
            }
        }
    ],
    user: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

// Add index for better query performance
agencyScehma.index({ user: 1 }, { unique: true });

const Agency = mongoose.model('Agency', agencyScehma);

export default Agency;