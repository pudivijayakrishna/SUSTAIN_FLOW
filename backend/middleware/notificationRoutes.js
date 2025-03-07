import express from 'express';
import {
    getNotifications,
    markNotificationAsRead,
    deleteNotification,
    clearReadNotifications,
    getUnreadNotifications
} from '../services/notificationService.js';

export const addNotificationRoutes = (router, userType = null) => {
    // Get notifications
    router.get('/notifications', async (req, res) => {
        try {
            const notifications = await getUnreadNotifications(req.user.username);
            res.json({ notifications });
        } catch (error) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({ error: 'Failed to fetch notifications' });
        }
    });

    // Mark notification as read
    router.put('/notifications/:id/read', async (req, res) => {
        try {
            const notification = await markNotificationAsRead(req.params.id);
            if (!notification) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            res.json({ success: true, notification });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({ error: 'Failed to mark notification as read' });
        }
    });

    // Delete notification
    router.delete('/notifications/:id', async (req, res) => {
        try {
            const notification = await deleteNotification(
                req.params.id,
                req.user.username,
                userType
            );
            if (!notification) {
                return res.status(404).json({ error: 'Notification not found' });
            }
            res.json({ success: true });
        } catch (error) {
            console.error('Error deleting notification:', error);
            res.status(500).json({ error: 'Failed to delete notification' });
        }
    });

    // Clear read notifications
    router.delete('/notifications/clear-read', async (req, res) => {
        try {
            await clearReadNotifications(req.user.username, userType);
            res.json({ success: true });
        } catch (error) {
            console.error('Error clearing notifications:', error);
            res.status(500).json({ error: 'Failed to clear notifications' });
        }
    });

    return router;
}; 