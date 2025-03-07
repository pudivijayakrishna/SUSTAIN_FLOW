import User from "../models/user.js";
import Points from "../models/userPoints.js";
import Agency from "../models/compostAgency.js";
import History from "../models/history.js";
import Transaction from "../models/transaction.js";
import Notification from "../models/notification.js";
import { createNotification } from "../services/notificationService.js";
import { 
    sendDonationResponseEmail, 
    sendEmail,
    sendDonationAcceptanceEmail,
    sendDonationRejectionEmail,
    sendDateProposalEmail,
    sendQRCodeRequestEmail,
    sendQRCodeGenerationEmail,
    sendPointsEarnedEmail,
    sendSuccessfulPickupEmail,
    sendPointsAddedEmail
} from '../services/emailService.js';
import Pickup from "../models/pickup.js";

// Send the pending requests data to the agency home page
export const queue = async (req, res) => {
    try {
        // Get pending transactions for this agency
        let transactions = await Transaction.find(
            { 
                receiver: req.user.username,
                status: 'pending'
            }
        )
        .populate('sender', 'name username email')
        .sort({ createdAt: -1 });

        // Format the transactions with waste type info
        const formattedTransactions = transactions.map(trans => ({
            ...trans.toObject(),
            wasteDetails: `${trans.wasteType} - ${trans.itemType}`,
            senderName: trans.sender?.name || trans.sender?.username
        }));

        return res.status(200).json({ 
            message: 'Requests data sent!', 
            requests: formattedTransactions 
        });
    } catch (error) {
        console.error('Error in queue:', error);
        return res.status(500).json({ error: 'Server Error!' });
    }
}

// Confirm the supplies request sent by a user
export const cofirm_supplies = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ 
            sender: req.body.sender, 
            receiver: req.user.username, 
            quantity: req.body.quantity,
            status: 'pending'
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found or already processed' });
        }

        // Update transaction status
        transaction.status = 'accepted';
        await transaction.save();

        // Create pickup record with initial status as 'pending'
        const pickup = await Pickup.create({
            transaction: transaction._id,
            donor: transaction.sender,
            receiver: req.user.username,
            quantity: transaction.quantity,
            wasteType: transaction.wasteType,
            itemType: transaction.itemType,
            status: 'pending',
            proposedDates: []
        });

        // Create detailed notification message based on transaction type
        let notificationMessage = '';
        let notificationTitle = 'Donation Request Accepted';
        
        if (transaction.type === 'ngo') {
            notificationMessage = `Your donation request of ${transaction.quantity}kg ${transaction.itemCategory}${
                transaction.itemCategory === 'others' ? ` (${transaction.itemName})` : ''
            } has been accepted`;
        } else {
            notificationMessage = `Your donation request of ${transaction.quantity}kg ${transaction.wasteType} waste (${transaction.itemType}) has been accepted`;
        }

        // Create notification with all required fields
        await createNotification({
            title: 'Donation Request Accepted',
            message: notificationMessage,
            targetUser: req.body.sender,
            userType: transaction.type === 'ngo' ? 'ngo' : 'donor',
            link: '/donations/history',
            documentId: transaction._id
        });

        // Handle points update
        let pointsDoc = await Points.findOne({ user: req.body.sender });
        if (!pointsDoc) {
            pointsDoc = new Points({
                user: req.body.sender,
                availablePoints: []
            });
        }

        const agencyPointIndex = pointsDoc.availablePoints.findIndex(
            ap => ap.agency === req.user.username
        );

        if (agencyPointIndex === -1) {
            pointsDoc.availablePoints.push({
                agency: req.user.username,
                points: transaction.quantity * 10
            });
        } else {
            pointsDoc.availablePoints[agencyPointIndex].points += transaction.quantity * 10;
        }

        await pointsDoc.save();

        // Create history record for earned points
        await History.create({
            sender: req.user.username,      // Agency is the sender
            receiver: req.body.sender,      // Donor is the receiver
            reward: {
                name: 'Donation Points',
                point: transaction.quantity * 10  // Points earned from donation
            },
            type: 'earn'
        });

        // Get the donor's details
        const donor = await User.findOne({ username: transaction.sender });
        if (!donor) {
            throw new Error('Donor not found');
        }

        // Send acceptance email with complete details
        await sendDonationAcceptanceEmail(
            donor,
            {
                type: transaction.type,
                wasteType: transaction.wasteType,
                itemType: transaction.itemType,
                itemCategory: transaction.itemCategory,
                itemName: transaction.itemName,
                quantity: transaction.quantity,
                description: transaction.description,
                points: transaction.quantity * 10,
                receiverName: req.user.name,
                _id: transaction._id,
                // Add these fields to ensure complete details
                status: 'accepted',
                items: transaction.type === 'ngo' ? 
                    `${transaction.itemCategory}${transaction.itemCategory === 'others' ? ` (${transaction.itemName})` : ''}` :
                    `${transaction.wasteType} waste (${transaction.itemType})`
            }
        );

        return res.status(200).json({ 
            message: 'Supply request accepted successfully',
            transaction: transaction,
            points: pointsDoc,
            pickup: pickup
        });

    } catch (error) {
        console.error('Error in confirm_supplies:', error);
        return res.status(500).json({ 
            error: 'Server Error',
            details: error.message 
        });
    }
}

// Reject the supplies request sent by a user
export const reject_supplies = async (req, res) => {
    try {
        const { id, sender, reason } = req.body;

        // Find transaction by ID and verify ownership
        const transaction = await Transaction.findOne({
            _id: id,
            receiver: req.user.username,
            status: 'pending'
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found or already processed' });
        }

        // Update transaction status
        transaction.status = 'rejected';
        transaction.rejectionReason = reason || 'Request rejected by agency';
        await transaction.save();

        // Create notification with correct type and targetUser
        await createNotification({
            title: 'Donation Request Rejected',
            message: `Your donation request has been rejected by ${req.user.name}`,
            targetUser: sender, // Use sender from request body
            type: 'donation', // Use valid enum value
            priority: 'high',
            link: '/donations/history',
            metadata: {
                transactionId: transaction._id,
                reason: transaction.rejectionReason
            }
        });

        // Get sender details for email
        const senderUser = await User.findOne({ username: sender });
        
        // Send email notification if sender exists
        if (senderUser) {
            await sendDonationRejectionEmail(
                senderUser,
                {
                    wasteType: transaction.wasteType,
                    itemType: transaction.itemType,
                    quantity: transaction.quantity
                },
                reason || 'Request rejected by agency'
            );
        }

        return res.status(200).json({ 
            message: 'Transaction rejected successfully',
            transaction: transaction
        });
    } catch (error) {
        console.error('Error in reject_supplies:', error);
        return res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Get the history of rewards redeemed by different users
export const history = async (req, res) => {
    try {
        let history = await History.findOne({ sender: req.user.username });
        if (history) {
            return res.status(200).json({ message: 'Redeem history sent!', history: history });
        }
        return res.status(200).json({ message: 'Redeem history sent!' });
    } catch (error) {
        console.log('Error: ', error.message);
        return res.status(500).json({ error: 'Server Error!' });
    }
}

// Get the list of rewards by composit Agency
export const rewards = async (req, res) => {
    try {
        let rewards = await Agency.findOne({ user: req.user.username }, { reward: 1 });
        return res.status(200).json({ message: 'Rewards sent seccussfully!', rewards: rewards });   

    } catch (error) {
        console.log('Error: ', error.message);
        return res.status(500).json({ error: 'Server Error!' });
    }
}

// Add a reward for the composite agency.
export const add_reward = async (req, res) => {
    try {
        // console.log(req.body);
        let reward = await Agency.findOneAndUpdate(
            { user: req.user.username },
            { 
              $addToSet: { reward: { name: req.body.name, point: req.body.point } }
            },
            { upsert: true, new: true }
          );
        //   console.log(reward);
        return res.status(200).json({ message: 'New Reward added sucessfully!' });

    } catch (error) {
        console.log('Error: ', error.message);
        return res.status(500).json({ error: 'Server Error!' });
    }
}

// Delete a reward
export const delete_reward = async (req, res) => {
    try {
        const { name, point } = req.body;

        // Find and update the user's reward array to remove the specified reward
        await Agency.findOneAndUpdate(
            { user: req.user.username },
            { 
              $pull: { reward: { name: name, point: point } }
            },
            { new: true }
        );

        return res.status(200).json({ message: 'Reward deleted successfully!' });
    } catch (error) {
        console.log('Error: ', error.message);
        return res.status(500).json({ error: 'Server Error!' });
    }
}

// Add this new function
export const transactions_history = async (req, res) => {
    try {
        // Get all transactions for this agency (both accepted and rejected)
        const transactions = await Transaction.find({
            receiver: req.user.username,
            status: { $in: ['accepted', 'rejected'] }
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Transaction history retrieved successfully',
            transactions: transactions
        });
    } catch (error) {
        console.error('Error fetching transaction history:', error);
        return res.status(500).json({ error: 'Server Error!' });
    }
};

export const getAgencyPickups = async (req, res) => {
    try {
        const pickups = await Pickup.find({ 
            receiver: req.user.username 
        })
        .sort({ createdAt: -1 })
        .lean();

        // Get donor details for each pickup
        const pickupsWithDetails = await Promise.all(pickups.map(async pickup => {
            const donor = await User.findOne(
                { username: pickup.donor },
                { name: 1, address: 1, contact: 1, location: 1 }
            ).lean();

            return {
                ...pickup,
                donorDetails: donor ? {
                    name: donor.name,
                    address: donor.address,
                    contact: donor.contact,
                    location: donor.location
                } : null
            };
        }));

        res.json({
            success: true,
            pickups: pickupsWithDetails
        });
    } catch (error) {
        console.error('Error fetching agency pickups:', error);
        res.status(500).json({ error: 'Failed to fetch pickups' });
    }
};

export const getPickupDetails = async (req, res) => {
    try {
        const pickup = await Pickup.findOne({
            _id: req.params.pickupId,
            receiver: req.user.username
        });

        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }

        res.json({
            success: true,
            pickup
        });
    } catch (error) {
        console.error('Error fetching pickup details:', error);
        res.status(500).json({ error: 'Failed to fetch pickup details' });
    }
};

export const schedulePickup = async (req, res) => {
    try {
        const { transactionId, dates } = req.body;

        // Validate dates
        if (!dates || dates.length === 0 || dates.length > 3) {
            return res.status(400).json({
                error: 'Please provide 1-3 pickup dates'
            });
        }

        // Get transaction details
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Create pickup record
        const pickup = await Pickup.create({
            transaction: transactionId,
            donor: transaction.sender,
            receiver: req.user.username,
            quantity: transaction.quantity,
            wasteType: transaction.wasteType,
            itemType: transaction.itemType,
            proposedDates: dates.map(d => ({
                date: d.date,
                timeSlot: d.timeSlot
            }))
        });

        // Send email to donor about proposed dates
        const donor = await User.findOne({ username: transaction.sender });
        if (donor?.email) {
            await sendDateProposalEmail(
                donor,
                dates.proposedDates,
                {
                    pickupId: pickup._id,
                    wasteType: pickup.wasteType,
                    quantity: pickup.quantity
                }
            );
        }

        // Create notification for donor
        await createNotification({
            title: 'Pickup Dates Proposed',
            message: `${req.user.name} has proposed pickup dates for your donation`,
            targetUser: transaction.sender,
            type: 'pickup',
            priority: 'high'
        });

        return res.status(200).json({
            success: true,
            message: 'Pickup scheduled successfully',
            pickup
        });

    } catch (error) {
        console.error('Error scheduling pickup:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

export const updatePickupStatus = async (req, res) => {
    try {
        const { pickupId, status, additionalPoints } = req.body;

        const pickup = await Pickup.findById(pickupId);
        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }

        if (pickup.receiver !== req.user.username) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        pickup.status = status;
        if (additionalPoints) {
            pickup.additionalPoints = additionalPoints;
        }
        await pickup.save();

        return res.status(200).json({
            success: true,
            message: 'Pickup status updated successfully',
            pickup
        });

    } catch (error) {
        console.error('Error updating pickup status:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// Add function to update points after pickup completion
export const completePickup = async (req, res) => {
    try {
        const { pickupId } = req.params;
        const { qrData, notes, additionalPoints } = req.body;

        // Validate QR data
        let qrInfo;
        try {
            qrInfo = JSON.parse(qrData);
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid QR code format'
            });
        }

        // Verify QR code data
        if (qrInfo.pickupId !== pickupId) {
            return res.status(400).json({
                success: false,
                error: 'QR code does not match this pickup'
            });
        }

        const pickup = await Pickup.findOne({
            _id: pickupId,
            receiver: req.user.username,
            status: 'scheduled'
        });

        if (!pickup) {
            return res.status(404).json({
                success: false,
                error: 'Pickup not found or cannot be completed'
            });
        }

        // Verify donor
        if (pickup.donor !== qrInfo.donor) {
            return res.status(400).json({
                success: false,
                error: 'Invalid donor information in QR code'
            });
        }

        // Check if QR code is expired (2 minutes)
        const qrTimestamp = new Date(qrInfo.timestamp);
        const now = new Date();
        const timeDiff = (now - qrTimestamp) / 1000 / 60; // difference in minutes
        if (timeDiff > 2) {
            return res.status(400).json({
                success: false,
                error: 'QR code has expired',
                expired: true
            });
        }

        // Update pickup
        pickup.status = 'completed';
        pickup.completedAt = new Date();
        pickup.completedBy = req.user.username;
        pickup.completionNotes = notes;
        pickup.additionalPoints = additionalPoints || 0;

        await pickup.save();

        // Add logging to debug
        console.log('Attempting to send emails for pickup completion');
        console.log('Agency user:', req.user);

        // Get donor details with email
        const donor = await User.findOne({ username: pickup.donor });
        if (!donor || !donor.email) {
            console.error('Donor email not found:', donor);
        } else {
            // Send successful pickup email to donor
            await sendSuccessfulPickupEmail(
                { email: donor.email, name: donor.name },
                pickup,
                false
            );
            console.log('Sent email to donor:', donor.email);
        }

        // Get agency details and send email
        const agency = await User.findOne({ username: req.user.username });
        if (agency && agency.email) {
            console.log('Sending email to agency:', agency.email);
            await sendSuccessfulPickupEmail(
                { email: agency.email, name: agency.name },
                pickup,
                true
            );
            console.log('Successfully sent email to agency');
        } else {
            console.error('Agency email not found:', agency);
        }

        // Add points and send points added email only if additional points were awarded
        if (additionalPoints > 0) {
            await Points.findOneAndUpdate(
                { user: pickup.donor },
                { 
                    $push: { 
                        availablePoints: {
                            agency: req.user.username,
                            points: additionalPoints
                        }
                    }
                },
                { upsert: true, new: true }
            );

            // Send points added email only if additional points were awarded
            if (donor && donor.email) {
                await sendPointsAddedEmail(
                    { email: donor.email, name: donor.name },
                    pickup,
                    additionalPoints
                );
            }
        }

        // Notify donor
        await createNotification({
            title: 'Pickup Completed',
            message: `Your pickup has been completed by ${req.user.username}${additionalPoints ? `. You earned ${additionalPoints} points!` : ''}`,
            targetUser: pickup.donor,
            type: 'pickup',
            link: `/donor/pickups/${pickup._id}`
        });

        await sendPointsEarnedEmail(
            await User.findOne({ username: pickup.donor }),
            {
                points: additionalPoints,
                agencyName: req.user.name
            }
        );

        res.json({
            success: true,
            pickup
        });

    } catch (error) {
        console.error('Error completing pickup:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to complete pickup'
        });
    }
};

// Propose dates for pickup
export const proposeDates = async (req, res) => {
    try {
        const { pickupId } = req.params;
        const { dates } = req.body;

        // Get pickup details
        const pickup = await Pickup.findOne({
            _id: pickupId,
            receiver: req.user.username
        }).populate('donor', 'name email username');

        if (!pickup) {
            return res.status(404).json({
                success: false,
                error: 'Pickup not found'
            });
        }

        // Update pickup with proposed dates
        pickup.proposedDates = dates.map(date => ({
            date: new Date(date.date),
            timeSlot: date.timeSlot
        }));
        pickup.status = 'dates_proposed';
        await pickup.save();

        // Get donor details
        const donor = await User.findOne({ username: pickup.donor });

        // Create notification
        await createNotification({
            title: 'Pickup Dates Proposed',
            message: `${req.user.name} has proposed pickup dates for your donation`,
            targetUser: pickup.donor,
            type: 'pickup',
            link: `/donor/pickups/${pickup._id}`
        });

        // Send email to donor with complete details
        await sendDateProposalEmail(
            donor,
            dates,
            {
                proposedDates: pickup.proposedDates,
                receiverName: req.user.name,
                wasteType: pickup.wasteType,
                itemType: pickup.itemType,
                quantity: pickup.quantity,
                pickupId: pickup._id
            }
        );

        res.json({
            success: true,
            pickup
        });

    } catch (error) {
        console.error('Error proposing dates:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to propose dates'
        });
    }
};

// Request QR code for pickup
export const requestQrCode = async (req, res) => {
    try {
        const { pickupId } = req.params;

        const pickup = await Pickup.findById(pickupId)
            .populate('donor', 'name email username')
            .populate('agency', 'name email username');

        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }

        pickup.qrRequested = true;
        pickup.status = 'qr_requested';
        await pickup.save();

        // Create notification
        await createNotification({
            sender: req.user.username,
            receiver: pickup.donor.username,
            message: `${req.user.username} has requested a QR code for pickup`,
            type: 'pickup',
            senderRole: 'agency',
            receiverRole: 'donor'
        });

        // Send email notification
        await sendQRCodeRequestEmail(pickup.donor, {
            pickupId: pickup._id,
            confirmedDate: pickup.confirmedDate,
            wasteType: pickup.wasteType,
            quantity: pickup.quantity
        });

        return res.status(200).json({ message: 'QR code requested successfully' });
    } catch (error) {
        console.error('Error in requestQrCode:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};