import express from 'express';
import Allfeedbacks from '../models/allfeedbacks.js';

const router = express.Router();

// Get all feedbacks
router.get('/all', async (req, res) => {
    try {
        const feedbacks = await Allfeedbacks.find()
            .sort({ createdAt: -1 })
            .limit(5);  // Get only latest 5 feedbacks
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching feedbacks' });
    }
});

// Add new feedback
router.post('/add', async (req, res) => {
    try {
        const newFeedback = new Allfeedbacks(req.body);
        await newFeedback.save();
        res.status(201).json(newFeedback);
    } catch (error) {
        res.status(400).json({ error: 'Error adding feedback' });
    }
});

export default router;
