import User from "../models/user.js";
import Points from "../models/userPoints.js";
import NGO from "../models/ngo.js";
import History from "../models/history.js";
import Transaction from "../models/transaction.js";
import Notification from "../models/notification.js";
import { createNotification } from '../services/notificationService.js';
import { sendDonationResponseEmail, sendDonationAcceptanceEmail, sendDateProposalEmail, sendSuccessfulPickupEmail, sendPointsAddedEmail } from '../services/emailService.js';
import Pickup from '../models/pickup.js';
import { sendEmail } from '../services/emailService.js';

// Get pending requests
export const requests = async (req, res) => {
    try {
        // Get all pending requests for this NGO with all fields
        const requests = await Transaction.find({ 
            receiver: req.user.username,
            type: 'ngo',
            status: 'pending'
        })
        .populate('sender', 'name username email') // Add any other fields you need
        .sort({ createdAt: -1 });
        
        // Format the requests with item category info
        const formattedRequests = requests.map(req => ({
            ...req.toObject(),
            itemDetails: req.itemCategory === 'others' ? 
                `${req.itemCategory} (${req.itemName})` : 
                req.itemCategory,
            senderName: req.sender?.name || req.sender?.username
        }));

        return res.status(200).json({ 
            message: 'Requests data sent!', 
            requests: formattedRequests || [] 
        });
    } catch (error) {
        console.error('Error in requests:', error);
        return res.status(500).json({ error: 'Server Error!' });
    }
};

// Accept request
export const accept_request = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ 
            sender: req.body.sender, 
            receiver: req.user.username, 
            quantity: req.body.quantity,
            status: 'pending'
        });
console.log("transaction",transaction);

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Update transaction status
        transaction.status = 'accepted';
        await transaction.save();

        // Create pickup entry
        try {
            const pickup = new Pickup({
                donor: transaction.sender,
                receiver: req.user.username,
                status: 'pending',
                quantity: transaction.quantity,
                itemType: transaction.itemType || 'general',
                wasteType: transaction.wasteType || 'general',
                description: transaction.description,
                createdAt: new Date()
            });

            await pickup.save();

            // Create notification for donor about pickup creation
            await createNotification({
                title: 'Donation Request Accepted',
                message: `Your donation request has been accepted and converted to a pickup. Please check your pickups section.`,
                targetUser: transaction.sender,
                userType: 'donor',
                link: '/donor/pickups',
                documentId: pickup._id
            });

        } catch (pickupError) {
            console.error('Error creating pickup:', pickupError);
            // Still accept the transaction but notify about pickup creation failure
            return res.status(200).json({
                success: true,
                message: 'Request accepted but pickup creation failed. Please create pickup manually.',
                transaction: transaction,
                error: 'Pickup creation failed'
            });
        }

        // Update points
        let pointsDoc = await Points.findOne({ user: req.body.sender });
        if (!pointsDoc) {
            pointsDoc = new Points({
                user: req.body.sender,
                availablePoints: []
            });
        }

        const ngoPointIndex = pointsDoc.availablePoints.findIndex(
            ap => ap.agency === req.user.username
        );

        if (ngoPointIndex === -1) {
            pointsDoc.availablePoints.push({
                agency: req.user.username,
                points: transaction.quantity * 10
            });
        } else {
            pointsDoc.availablePoints[ngoPointIndex].points += transaction.quantity * 10;
        }

        await pointsDoc.save();

        // Create history entry
        await History.create({
            sender: req.user.username,
            receiver: transaction.sender,
            reward: {
                name: 'Donation Points',
                point: transaction.quantity * 10
            },
            type: 'earn'
        });

        // Send email notification
        await sendDonationResponseEmail(
            await User.findOne({ username: transaction.sender }), // donor
            {
                status: 'approved',
                items: transaction.itemCategory,
                points: transaction.points,
                message: req.body.message
            }
        );

        // Send email notification with complete details
        await sendDonationAcceptanceEmail(
            await User.findOne({ username: transaction.sender }),
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
            message: 'Request accepted and pickup created successfully!',
            transaction: transaction
        });

    } catch (error) {
        console.error('Error in accept_request:', error);
        return res.status(500).json({ 
            error: 'Server Error',
            details: error.message 
        });
    }
};

// Reject request
export const reject_request = async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndUpdate(
            { 
                sender: req.body.sender,
                receiver: req.user.username,
                quantity: req.body.quantity,
                status: 'pending'
            },
            { $set: { status: 'rejected' } },
            { new: true }
        );

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        // Create detailed notification message
        const notificationMessage = `Your donation request of ${transaction.quantity}kg ${transaction.itemCategory}${
            transaction.itemCategory === 'others' ? ` (${transaction.itemName})` : ''
        } has been rejected`;

        // Create notification using notification service
        await createNotification({
            title: 'Donation Request Rejected',
            message: notificationMessage,
            targetUser: transaction.sender,
            userType: 'donor',
            link: '/donations/history',
            documentId: transaction._id
        });

        // Send email notification
        await sendDonationResponseEmail(
            await User.findOne({ username: transaction.sender }), // donor
            {
                status: 'rejected',
                items: transaction.items,
                points: transaction.points,
                message: req.body.message
            }
        );

        return res.status(200).json({ 
            message: 'Request rejected successfully!',
            transaction: transaction
        });

    } catch (error) {
        console.error('Error in reject_request:', error);
        return res.status(500).json({ 
            error: 'Server Error',
            details: error.message 
        });
    }
};

// Get NGO rewards
export const rewards = async (req, res) => {
    try {
        let rewards = await NGO.findOne({ user: req.user.username }, { reward: 1 });
        return res.status(200).json({ message: 'Rewards sent successfully!', rewards: rewards });   
    } catch (error) {
        console.log('Error: ', error.message);
        return res.status(500).json({ error: 'Server Error!' });
    }
};

// Add a reward
export const add_reward = async (req, res) => {
    try {
        let reward = await NGO.findOneAndUpdate(
            { user: req.user.username },
            { 
                $addToSet: { reward: { name: req.body.name, point: req.body.point } }
            },
            { upsert: true, new: true }
        );

        // Create history entry for new reward
        await History.create({
            sender: req.user.username,
            receiver: 'system',
            reward: {
                name: req.body.name,
                point: req.body.point
            },
            type: 'ngo_reward'
        });

        return res.status(200).json({ message: 'New Reward added successfully!' });
    } catch (error) {
        console.log('Error: ', error.message);
        return res.status(500).json({ error: 'Server Error!' });
    }
};

// Delete a reward
export const delete_reward = async (req, res) => {
    try {
        const { name, point } = req.body;

        await NGO.findOneAndUpdate(
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
};

// Get history
export const history = async (req, res) => {
    try {
        // Get both donation history and reward history
        let history = await History.find({
            $or: [
                { sender: req.user.username },
                { receiver: req.user.username },
                { type: { $in: ['ngo_donation', 'ngo_reward'] } }
            ]
        }).sort({ createdAt: -1 });

        return res.status(200).json({ 
            message: 'History sent successfully!', 
            history: { history } 
        });
    } catch (error) {
        console.log('Error: ', error.message);
        return res.status(500).json({ error: 'Server Error!' });
    }
};

// Get all pickups for NGO
export const getPickups = async (req, res) => {
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
        console.error('Error fetching NGO pickups:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch pickups'
        });
    }
};

// Update pickup status
export const updatePickupStatus = async (req, res) => {
    try {
        const { pickupId } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'dates_proposed', 'scheduled', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status'
            });
        }

        const pickup = await Pickup.findOne({
            _id: pickupId,
            receiver: req.user.username
        });

        if (!pickup) {
            return res.status(404).json({
                success: false,
                error: 'Pickup not found'
            });
        }

        // Update status
        pickup.status = status;
        if (status === 'completed') {
            pickup.completedAt = new Date();
            pickup.completedBy = req.user.username;
        }

        await pickup.save();

        // Notify donor
        await createNotification({
            title: `Pickup ${status}`,
            message: `Your pickup has been ${status} by ${req.user.username}`,
            targetUser: pickup.donor,
            type: 'pickup_update',
            link: `/donor/pickups/${pickup._id}`
        });

        res.json({
            success: true,
            pickup
        });

    } catch (error) {
        console.error('Error updating pickup status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update pickup status'
        });
    }
};

// Complete pickup
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
        console.log('NGO user:', req.user);

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

        // Get NGO details and send email
        const ngo = await User.findOne({ username: req.user.username });
        if (ngo && ngo.email) {
            console.log('Sending email to NGO:', ngo.email);
            await sendSuccessfulPickupEmail(
                { email: ngo.email, name: ngo.name },
                pickup,
                true
            );
            console.log('Successfully sent email to NGO');
        } else {
            console.error('NGO email not found:', ngo);
        }

        // Add points and send points added email only if additional points were awarded
        if (additionalPoints > 0) {
            const pointsDoc = await Points.findOneAndUpdate(
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

        res.json({
            success: true,
            pickup
        });

    } catch (error) {
        console.error('Error completing pickup:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to complete pickup',
            details: error.message
        });
    }
};

// Cancel pickup
export const cancelPickup = async (req, res) => {
    try {
        const { pickupId } = req.params;
        const { reason } = req.body;

        const pickup = await Pickup.findOne({
            _id: pickupId,
            receiver: req.user.username,
            status: { $in: ['pending', 'scheduled'] }
        });

        if (!pickup) {
            return res.status(404).json({
                success: false,
                error: 'Pickup not found or cannot be cancelled'
            });
        }

        // Update pickup
        pickup.status = 'cancelled';
        pickup.completionNotes = reason;

        await pickup.save();

        // Notify donor
        await createNotification({
            title: 'Pickup Cancelled',
            message: `Your pickup has been cancelled by ${req.user.username}${reason ? `: ${reason}` : ''}`,
            targetUser: pickup.donor,
            type: 'pickup_cancelled',
            link: `/donor/pickups/${pickup._id}`
        });

        res.json({
            success: true,
            pickup
        });
    } catch (error) {
        console.error('Error cancelling pickup:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to cancel pickup'
        });
    }
};

// Helper function to get status color
const getStatusColor = (status) => {
    switch (status) {
        case 'pending':
            return '#ffa726'; // Orange
        case 'scheduled':
            return '#29b6f6'; // Light Blue
        case 'completed':
            return '#66bb6a'; // Green
        case 'cancelled':
            return '#ef5350'; // Red
        default:
            return '#9e9e9e'; // Grey
    }
};

// Propose dates for pickup
export const proposeDates = async (req, res) => {
    try {
        const { pickupId } = req.params;
        const { dates } = req.body;

        // Validate dates
        if (!dates || !Array.isArray(dates) || dates.length === 0 || dates.length > 3) {
            return res.status(400).json({
                success: false,
                error: 'Please provide 1-3 valid pickup dates'
            });
        }

        // Find pickup and verify permissions
        const pickup = await Pickup.findOne({
            _id: pickupId,
            receiver: req.user.username,
            status: { $in: ['pending', 'dates_proposed'] }
        });

        if (!pickup) {
            return res.status(404).json({
                success: false,
                error: 'Pickup not found or cannot be scheduled'
            });
        }

        // Update pickup with proposed dates
        pickup.proposedDates = dates.map(date => ({
            date: new Date(date.date),
            timeSlot: date.timeSlot
        }));
        pickup.status = 'dates_proposed';
        await pickup.save();
        const donor = await User.findOne({ username: pickup.donor });

        // Create notification for donor
        await createNotification({
            title: 'Pickup Dates Proposed',
            message: `${req.user.role === 'ngo' ? 'NGO' : 'Compost Agency'} ${req.user.username} has proposed dates for your pickup`,
            targetUser: pickup.donor,
            type: 'pickup',
            link: `/donor/pickups/${pickup._id}`
        });
        const pickupDetails={
            proposedDates: pickup.proposedDates,
            receiverName: req.user.name,
            wasteType: pickup.wasteType,
            itemType: pickup.itemType,
            quantity: pickup.quantity,
            pickupId: pickup._id
        }
   await sendDateProposalEmail(
            donor,
            dates,
        pickupDetails
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

// Add this function for getting pickup details
export const getPickupDetails = async (req, res) => {
    try {
        const pickup = await Pickup.findOne({
            _id: req.params.pickupId,
            receiver: req.user.username
        });

        if (!pickup) {
            return res.status(404).json({
                success: false,
                error: 'Pickup not found'
            });
        }

        res.json({
            success: true,
            pickup
        });
    } catch (error) {
        console.error('Error fetching pickup details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch pickup details'
        });
    }
};

// Request QR code
export const requestQrCode = async (req, res) => {
    try {
        const { pickupId } = req.params;
        const pickup = await Pickup.findOne({
            _id: pickupId,
            receiver: req.user.username,
            status: 'scheduled'
        });

        if (!pickup) {
            return res.status(404).json({
                success: false,
                error: 'Pickup not found or cannot request QR code'
            });
        }

        // Update pickup status
        pickup.status = 'qr_requested';
        pickup.qrRequestDetails = {
            requestedBy: req.user.username,
            requestedAt: new Date()
        };
        await pickup.save();

        // Try to send notification, but don't block if it fails
        try {
            await createNotification({
                title: 'QR Code Requested',
                message: `${req.user.username} has requested a QR code for pickup #${pickup._id}`,
                targetUser: pickup.donor,
                type: 'qr_request',
                link: `/donor/pickups/${pickup._id}`
            });
        } catch (error) {
            console.error('Error creating notification:', error);
        }

        res.json({
            success: true,
            message: 'QR code request sent to donor',
            pickup
        });

    } catch (error) {
        console.error('Error requesting QR code:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to request QR code'
        });
    }
};