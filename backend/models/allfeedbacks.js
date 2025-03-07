import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  feedback: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Add indexes for better query performance
feedbackSchema.index({ email: 1 });
feedbackSchema.index({ createdAt: -1 });

const Allfeedbacks = mongoose.model("Allfeedbacks", feedbackSchema);
export default Allfeedbacks;