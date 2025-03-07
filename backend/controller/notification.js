import Notification from '../models/notification.js';

export const getNotifications = async (req) => {
    try {
        // Check if user exists in the request
        if (!req?.user?.username) {
            throw new Error('Unauthorized access');
        }

        // Get notifications for the user, including unread status
        const notifications = await Notification.find({ 
            targetUser: req.user.username 
        }).sort({ createdAt: -1 });

        // Ensure each notification has proper read status
        return notifications.map(notification => ({
            ...notification.toObject(),
            read: !!notification.read // Convert to boolean
        }));
    } catch (error) {
        console.error('Error in getNotifications:', error);
        throw error;
    }
};

export const markAsRead = async (notificationId) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );
        
        if (!notification) {
            throw new Error('Notification not found');
        }

        return {
            ...notification.toObject(),
            read: true
        };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

export const deleteNotification = async (notificationId) => {
    try {
        const notification = await Notification.findByIdAndDelete(notificationId);
        
        if (!notification) {
            throw new Error('Notification not found');
        }

        return notification;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

export const clearReadNotifications = async (username) => {
    try {
        const result = await Notification.deleteMany({
            targetUser: username,
            read: true
        });

        return {
            success: true,
            deletedCount: result.deletedCount
        };
    } catch (error) {
        console.error('Error clearing read notifications:', error);
        throw error;
    }
};