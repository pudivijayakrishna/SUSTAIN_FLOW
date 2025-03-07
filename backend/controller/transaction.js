import Transaction from '../models/transaction.js';
import User from '../models/user.js';
import { createNotification } from '../services/notificationService.js';
import { sendEmail } from '../services/emailService.js';
import { 
    getDonorRequestConfirmation, 
    getAgencyDonationRequest 
} from '../mailTemplates/index.js';

export const createTransaction = async (data) => {
    try {
        const { 
            sender, 
            receiver, 
            recipientEmail, 
            type,
            quantity,
            wasteType,
            itemType,
            itemCategory,
            itemName,
            description,
            status 
        } = data;

        if (!recipientEmail) {
            throw new Error('Recipient email is required');
        }

        // Create transaction with validated data
        const transaction = new Transaction({
            sender,
            receiver,
            type, // 'ngo' or 'compostAgency'
            quantity,
            description,
            status: status || 'pending'
        });

        // Add type-specific fields
        if (type === 'ngo') {
            transaction.itemCategory = itemCategory;
            if (itemCategory === 'others') {
                transaction.itemName = itemName;
            }
        } else if (type === 'compostAgency') {
            transaction.wasteType = wasteType;
            transaction.itemType = itemType;
        }

        await transaction.save();

        // Send email notification
        await sendEmail(
            recipientEmail,
            'New Donation Request',
            `You have received a new donation request from ${sender}`,
            'donation-request'
        );

        return transaction;

    } catch (error) {
        console.error('Transaction creation error:', error);
        throw error;
    }
};

export const updateTransactionStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { status, reason } = req.body;

        const transaction = await Transaction.findByIdAndUpdate(
            transactionId,
            { status, rejectionReason: reason },
            { new: true }
        );

        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }

        // Send notification and email based on status
        const sender = await User.findOne({ username: transaction.sender });
        const receiver = await User.findOne({ username: transaction.receiver });

        if (status === 'accepted') {
            // Notification for acceptance
            await createNotification({
                title: 'Donation Request Accepted',
                message: `Your donation request has been accepted by ${receiver.name}`,
                targetUser: sender.username,
                type: 'donation_accepted'
            });
        } else if (status === 'rejected') {
            // Notification for rejection
            await createNotification({
                title: 'Donation Request Rejected',
                message: `Your donation request has been rejected by ${receiver.name}`,
                targetUser: sender.username,
                type: 'donation_rejected'
            });
        }

        res.json({
            success: true,
            transaction
        });

    } catch (error) {
        console.error('Error in updateTransactionStatus:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to update transaction'
        });
    }
}; 