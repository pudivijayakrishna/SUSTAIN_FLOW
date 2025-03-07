import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { createFeedback, getFeedback } from '../controller/feedback.js';
import allfeedbacks from '../models/allfeedbacks.js';

const router = express.Router();

router.post('/create', authMiddleware, createFeedback);
router.get('/', authMiddleware, getFeedback);
router.post('/', async (req, res) => {
    const { name, email, feedback } = req.body;
  
    if (!name || !email || !feedback) {
      return res.status(400).json({ message: "All fields are required." });
    }
  
    try {
      const newFeedback = new allfeedbacks({ name, email, feedback });
      await newFeedback.save();
  
      res.status(201).json({ message: "Feedback submitted successfully!" });
    } catch (error) {
      console.error("Error saving feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback." });
    }
  });
  
  // GET: Retrieve Feedbacks
  router.get("/allfeedback", async (req, res) => {
    try {
      const feedbacks = await allfeedbacks.find().sort({ createdAt: -1 });  // Latest first
      res.json(feedbacks);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedbacks." });
    }
  });

export default router; 