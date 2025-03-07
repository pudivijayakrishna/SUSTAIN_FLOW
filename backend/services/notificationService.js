import Notification from '../models/notification.js';

export const createNotification = async ({
    title,
    message,
    targetUser,
    type = 'system',
    priority = 'medium',
    link = null,
    metadata = null
}) => {
    try {
        // Validate notification type against enum values
        const validTypes = ['system', 'pickup', 'points', 'donation', 'reward', 'verification', 'supplies'];
        if (!validTypes.includes(type)) {
            type = 'system'; // Default to system if invalid type
        }

        if (!targetUser) {
            throw new Error('targetUser is required for notification');
        }

        const notification = new Notification({
            title,
            message,
            targetUser,
            type,
            priority,
            link,
            metadata
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.warn('Error creating notification:', error);
        throw error;
    }
};

export const markNotificationAsRead = async (notificationId) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );
        return notification;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

export const getUnreadNotifications = async (username) => {
    try {
        const notifications = await Notification.find({
            targetUser: username,
            read: false
        }).sort({ createdAt: -1 });
        return notifications;
    } catch (error) {
        console.error('Error getting unread notifications:', error);
        throw error;
    }
};

export const getNotifications = async (username, userType) => {
    try {
        return await Notification.find({
            targetUser: username,
            userType: userType,
            read: false
        }).sort({ createdAt: -1 });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

export const deleteNotification = async (notificationId, username, userType) => {
    try {
        return await Notification.findOneAndDelete({
            _id: notificationId,
            targetUser: username,
            userType: userType
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

export const clearReadNotifications = async (username, userType) => {
    try {
        return await Notification.deleteMany({
            targetUser: username,
            userType: userType,
            read: true
        });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        throw error;
    }
};