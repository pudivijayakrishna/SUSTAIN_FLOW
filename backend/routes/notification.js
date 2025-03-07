import express from 'express';
import { authenticateToken } from '../config/authMiddleware.js';
import * as notificationController from '../controller/notification.js';
import Notification from '../models/notification.js';

const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);

// Get notifications with explicit read status in response
router.get('/', async (req, res) => {
    try {
        const notifications = await notificationController.getNotifications(req);
        res.json({
            success: true,
            notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
    try {
        const notification = await notificationController.markAsRead(req.params.id);
        res.json({ 
            success: true, 
            notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Clear read notifications
router.delete('/clear-read', async (req, res) => {
    try {
        const result = await notificationController.clearReadNotifications(req.user.username);
        res.json(result);
    } catch (error) {
        console.error('Error clearing read notifications:', error);
        res.status(500).json({ error: 'Failed to clear notifications' });
    }
});

// Delete individual notification
router.delete('/:id', async (req, res) => {
    try {
        await notificationController.deleteNotification(req.params.id);
        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

export default router;