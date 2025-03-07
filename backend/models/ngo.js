import mongoose from "mongoose";

const ngoSchema = new mongoose.Schema({
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
ngoSchema.index({ user: 1 }, { unique: true });

const NGO = mongoose.model('NGO', ngoSchema);
export default NGO;