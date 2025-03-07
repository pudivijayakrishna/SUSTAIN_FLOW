import Notification from '../models/notification.js';

export const notifyAdmin = async (subject, data) => {
    try {
        // Create notification in database instead of sending email
        await Notification.create({
            title: subject,
            message: `${data.username} (${data.role}) ${data.resubmission ? 'resubmitted' : 'submitted'} a document`,
            targetUser: 'admin',
            documentId: data.userId,
            link: '/admin/verifications'
        });

    } catch (error) {
        console.error('Admin notification error:', error);
    }
}; 