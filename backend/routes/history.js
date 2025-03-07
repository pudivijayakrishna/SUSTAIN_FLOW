import express from 'express';
import History from '../models/history.js';
import { authenticateToken } from '../config/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    try {
        const history = await History.find({
            $or: [
                { sender: req.user.username },
                { receiver: req.user.username }
            ]
        }).sort({ createdAt: -1 });

        return res.status(200).json({ history });
    } catch (error) {
        console.error('Error fetching history:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router; 