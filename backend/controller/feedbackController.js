import Feedback from '../models/feedback.js';
import Pickup from '../models/pickup.js';
import { createNotification } from '../services/notificationService.js';

export const submitFeedback = async (req, res) => {
    try {
        const { pickupId } = req.params;
        const { rating, comment } = req.body;

        const pickup = await Pickup.findById(pickupId);
        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }

        let userType;
        if (pickup.donor === req.user.username) {
            userType = 'donor';
        } else if (pickup.receiver === req.user.username) {
            userType = pickup.receiverType;
        } else {
            return res.status(403).json({ error: 'Not authorized to submit feedback' });
        }

        const feedback = await Feedback.create({
            pickup: pickupId,
            userId: req.user._id,
            username: req.user.username,
            userType,
            rating,
            comment
        });

        await createNotification({
            title: 'New Feedback Received',
            message: `New feedback submitted for pickup #${pickupId}`,
            targetUser: 'admin',
            type: 'feedback'
        });

        res.status(201).json({
            success: true,
            feedback
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ 
                error: 'You have already submitted feedback for this pickup' 
            });
        }
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
};

export const getFeedbackByPickup = async (req, res) => {
    try {
        const { pickupId } = req.params;
        const feedback = await Feedback.find({ pickup: pickupId })
            .sort('-createdAt');

        res.json({
            success: true,
            feedback
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
};

export const getFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find({
            userId: req.user._id
        })
        .populate('pickup')
        .sort('-createdAt');

        res.json({
            success: true,
            feedback
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
}; 