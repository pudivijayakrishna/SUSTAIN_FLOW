import Feedback from '../models/feedback.js';
import User from '../models/user.js';
import { createNotification } from '../services/notificationService.js';

// Create feedback
export const createFeedback = async (req, res) => {
    try {
        const { rating, comment, targetUser } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Create feedback
        const feedback = await Feedback.create({
            fromUser: req.user.username,
            toUser: targetUser,
            rating,
            comment
        });

        // Send notification to target user
        try {
            await createNotification({
                title: 'New Feedback Received',
                message: `${req.user.username} has left you feedback`,
                targetUser,
                type: 'feedback',
                priority: 'normal'
            });
        } catch (notificationError) {
            console.error('Error sending notification:', notificationError);
            // Continue execution even if notification fails
        }

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            feedback
        });

    } catch (error) {
        console.error('Create feedback error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get feedback
export const getFeedback = async (req, res) => {
    try {
        const { username } = req.query;
        const query = username ? { toUser: username } : { toUser: req.user.username };

        // Get feedback with user details
        const feedback = await Feedback.find(query)
            .sort({ createdAt: -1 })
            .populate('fromUser', 'name username role')
            .lean();

        // Calculate average rating
        const totalRating = feedback.reduce((sum, item) => sum + item.rating, 0);
        const averageRating = feedback.length > 0 ? totalRating / feedback.length : 0;

        res.json({
            success: true,
            feedback,
            stats: {
                count: feedback.length,
                averageRating: parseFloat(averageRating.toFixed(1))
            }
        });

    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}; 