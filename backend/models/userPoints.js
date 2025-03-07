import mongoose from "mongoose";

const pointsSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        unique: true
    },
    availablePoints: [{
        agency: {
            type: String,
            required: true
        },
        points: {
            type: Number,
            default: 0,
            min: 0
        }
    }]
}, {
    timestamps: true
});

// Add indexes for better query performance
pointsSchema.index({ user: 1 }, { unique: true });
pointsSchema.index({ 'availablePoints.agency': 1 });
pointsSchema.index({ 'availablePoints.points': -1 });

const Points = mongoose.model('Points', pointsSchema);
export default Points;