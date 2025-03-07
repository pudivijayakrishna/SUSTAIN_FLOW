import Pickup from '../models/pickup.js';
import User from '../models/user.js';
import Points from '../models/userPoints.js';
import { generatePickupQR, verifyQRCode } from '../services/qrService.js';
import { 
    sendDateProposalEmail,
    sendQRCodeRequestEmail,
    sendQRCodeGenerationEmail,
    sendPointsEarnedEmail,
    sendPickupProposalEmail,
    sendPickupConfirmationEmail,
    sendSuccessfulPickupEmail,
    sendQRRequestEmail,
    sendPointsAddedEmail,
    sendPickupCompletionEmail
} from '../services/emailService.js';
import { createNotification } from '../services/notificationService.js';

const updateDonorPoints = async (donorUsername, receiverUsername, points) => {
    try {
        let pointsDoc = await Points.findOne({ user: donorUsername });
        if (!pointsDoc) {
            pointsDoc = new Points({
                user: donorUsername,
                availablePoints: []
            });
        }

        const receiverIndex = pointsDoc.availablePoints.findIndex(
            p => p.agency === receiverUsername
        );

        if (receiverIndex !== -1) {
            pointsDoc.availablePoints[receiverIndex].points += points;
        } else {
            pointsDoc.availablePoints.push({
                agency: receiverUsername,
                points: points
            });
        }

        await pointsDoc.save();
        return pointsDoc;
    } catch (error) {
        console.error('Error updating donor points:', error);
        throw error;
    }
};

const sendPickupCompletionNotifications = async (pickup) => {
    try {
        // Get user details
        const donor = await User.findOne({ username: pickup.donor });
        const receiver = await User.findOne({ username: pickup.receiver });

        // Get donor's current points
        const pointsDoc = await Points.findOne({ user: pickup.donor });
        const currentPoints = pointsDoc?.availablePoints.reduce((sum, p) => sum + p.points, 0) || 0;

        // Send emails
        if (donor?.email) {
            await sendSuccessfulPickupEmail(donor, {
                ...pickup.toObject(),
                currentPoints
            });
        }

        if (receiver?.email) {
            await sendSuccessfulPickupEmail(receiver, pickup.toObject(), true);
        }

        // Create notifications
        await Promise.all([
            createNotification({
                title: 'Pickup Completed',
                message: `Pickup of ${pickup.quantity}kg ${pickup.wasteType} has been completed`,
                targetUser: pickup.donor,
                link: '/donor/pickups',
                type: 'pickup'
            }),
            createNotification({
                title: 'Pickup Completed',
                message: `Pickup from ${pickup.donor} has been completed`,
                targetUser: pickup.receiver,
                link: '/agency/pickups',
                type: 'pickup'
            })
        ]);
    } catch (error) {
        console.error('Error sending completion notifications:', error);
        throw error;
    }
};

const getUserDetails = async (username) => {
    try {
        const user = await User.findOne({ username });
        if (!user) return null;

        return {
            address: user.address,
            contact: user.contact,
            location: user.location,
            name: user.name
        };
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
};

export const proposeDates = async (req, res) => {
    try {
        const { pickupId, dates } = req.body;
        
        // Validate dates
        if (!dates || dates.length === 0 || dates.length > 3) {
            return res.status(400).json({
                error: 'Please provide 1-3 pickup dates'
            });
        }

        // Find the pickup
        const pickup = await Pickup.findById(pickupId);
        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }

        // Verify that the agency is the one proposing dates
        if (pickup.receiver !== req.user.username) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Update pickup with proposed dates
        pickup.proposedDates = dates.map(d => ({
            date: new Date(d.date),
            timeSlot: d.timeSlot
        }));
        pickup.status = 'dates_proposed';
        await pickup.save();

        // Send email to donor
        const donor = await User.findOne({ username: pickup.donor });
        if (donor?.email) {
            await sendPickupProposalEmail(donor, {
                ...pickup.toObject(),
                receiverName: req.user.name
            });
        }

        // Create notification for donor
        await createNotification({
            title: 'Pickup Dates Proposed',
            message: 'Agency has proposed pickup dates',
            targetUser: pickup.donor,
            type: 'pickup',
            priority: 'high'
        });

        res.json({
            success: true,
            message: 'Pickup dates proposed successfully',
            pickup
        });

    } catch (error) {
        console.error('Error proposing dates:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const confirmPickupDate = async (req, res) => {
    try {
        const pickupId = req.params.pickupId;
        const { dateId } = req.body;

        if (!pickupId || !dateId) {
            return res.status(400).json({ 
                error: 'Both pickup ID and date ID are required' 
            });
        }

        const pickup = await Pickup.findById(pickupId);
        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }

        // Verify that the donor is the one confirming
        if (pickup.donor !== req.user.username) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const selectedDate = pickup.proposedDates.id(dateId);
        if (!selectedDate) {
            return res.status(404).json({ error: 'Proposed date not found' });
        }

        pickup.confirmedDate = {
            date: selectedDate.date,
            timeSlot: selectedDate.timeSlot
        };
        pickup.status = 'scheduled';
        await pickup.save();

        // Send confirmation email to agency
        const agency = await User.findOne({ username: pickup.receiver });
        if (agency?.email) {
            await sendPickupConfirmationEmail(agency, {
                ...pickup.toObject(),
                donorName: req.user.name
            });
        }

        // Create notification for agency
        await createNotification({
            title: 'Pickup Date Confirmed',
            message: `Donor has confirmed pickup date for ${pickup.quantity}kg ${pickup.wasteType}`,
            targetUser: pickup.receiver,
            type: 'pickup',
            priority: 'high'
        });

        return res.json({
            success: true,
            message: 'Pickup date confirmed successfully',
            pickup
        });

    } catch (error) {
        console.error('Error confirming pickup date:', error);
        return res.status(500).json({ 
            error: 'Failed to confirm date',
            details: error.message 
        });
    }
};

export const requestQRCode = async (req, res) => {
    try {
        const pickup = req.pickup;
        const donor = await User.findOne({ username: pickup.donor });
        
        if (!donor) {
            return res.status(404).json({ error: 'Donor not found' });
        }

        // Update QR request time and status
        pickup.lastQrRequestTime = new Date();
        pickup.qrRequestedBy = req.user.username;
        await pickup.save();

        // Send notification to donor with a valid notification type
        await createNotification({
            title: 'QR Code Requested',
            message: `${req.user.username} has requested a QR code for pickup completion`,
            targetUser: pickup.donor,
            type: 'pickup',
            priority: 'high',
            link: `/donor/pickups/${pickup._id}`
        });
console.log("pickup in requestQRCode",pickup);

        // Send email to donor
        if (donor.email) {
            await sendQRRequestEmail(donor, pickup);
        }

        res.json({
            success: true,
            message: 'QR code request sent to donor',
            pickup
        });

    } catch (error) {
        console.error('Error requesting QR code:', error);
        res.status(500).json({ 
            error: 'Failed to request QR code',
            details: error.message 
        });
    }
};

export const generateQRCode = async (req, res) => {
    try {
        const { pickupId } = req.params;
        const pickup = await Pickup.findById(pickupId);

        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }

        // Verify that the requester is the donor
        if (pickup.donor !== req.user.username) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Check QR generation attempts
        if (pickup.qrGenerationAttempts >= 3) {
            return res.status(400).json({ 
                error: 'Maximum QR code generation attempts reached. Please contact support.' 
            });
        }

        // Generate QR code
        const qrCode = await generatePickupQR(pickup._id);
        
        // Increment generation attempts
        pickup.qrGenerationAttempts += 1;
        
        // Add to pickup's QR codes
        pickup.qrCodes.push({
            code: qrCode,
            generatedAt: new Date(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
            status: 'active'
        });

        await pickup.save();

        // Send notification to agency
        await createNotification({
            title: 'QR Code Generated',
            message: `Donor has generated QR code. Attempts remaining: ${3 - pickup.qrGenerationAttempts}`,
            targetUser: pickup.receiver,
            type: 'pickup'
        });

        // Send email to agency
        const agency = await User.findOne({ username: pickup.receiver });
        if (agency?.email) {
            await sendQRCodeGenerationEmail(agency, pickup, qrCode);
        }

        res.json({
            success: true,
            qrCode,
            expiresIn: 5 * 60, // 5 minutes
            attemptsRemaining: 3 - pickup.qrGenerationAttempts
        });

    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const completePickup = async (req, res) => {
    try {
        const pickup = req.pickup;
        const { qrData, additionalPoints, notes } = req.body;

        // Verify QR code
        const verification = verifyQRCode(qrData, pickup);
        if (!verification.valid) {
            return res.status(400).json({ 
                error: verification.message,
                expired: verification.message.includes('expired')
            });
        }

        // Update QR code status
        const qrCode = pickup.qrCodes.find(qr => qr.code === qrData);
        if (qrCode) {
            qrCode.status = 'used';
            qrCode.scannedAt = new Date();
            qrCode.scannedBy = req.user.username;
        }

        // Update pickup status
        pickup.status = 'completed';
        pickup.completedAt = new Date();
        pickup.completedBy = req.user.username;
        pickup.completionNotes = notes;
        pickup.additionalPoints = additionalPoints || 0;

        await pickup.save();

        // Send notifications
        await Promise.all([
            createNotification({
                title: 'Pickup Completed',
                message: `Pickup of ${pickup.quantity}kg has been completed`,
                targetUser: pickup.donor,
                type: 'pickup'
            }),
            createNotification({
                title: 'Points Added',
                message: `${additionalPoints} points added for pickup completion`,
                targetUser: pickup.donor,
                type: 'points'
            })
        ]);

        // Send email to donor
        const donor = await User.findOne({ username: pickup.donor });
        if (donor?.email) {
            await sendPointsAddedEmail(donor, additionalPoints, pickup);
        }

        // Send email to agency
        const agency = await User.findOne({ username: pickup.receiver });
        if (agency?.email) {
            await sendPickupCompletionEmail(agency, pickup);
        }

        res.json({
            success: true,
            message: 'Pickup completed successfully',
            pickup
        });

    } catch (error) {
        console.error('Error completing pickup:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getPickups = async (req, res) => {
    try {
        const pickups = await Pickup.find()
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Pickups retrieved successfully',
            pickups
        });
    } catch (error) {
        console.error('Error in getPickups:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

export const deletePickup = async (req, res) => {
    try {
        const { pickupId } = req.params;
        const pickup = await Pickup.findById(pickupId);

        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }

        if (pickup.status !== 'completed') {
            return res.status(400).json({ 
                error: 'Can only delete completed pickups' 
            });
        }

        await Pickup.findByIdAndDelete(pickupId);

        return res.status(200).json({
            message: 'Pickup deleted successfully'
        });
    } catch (error) {
        console.error('Error in deletePickup:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

export const confirmDate = async (req, res) => {
    try {
        const { pickupId, dateId } = req.body;

        const pickup = await Pickup.findById(pickupId);
        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }

        // Verify that the donor is the one confirming
        if (pickup.donor !== req.user.username) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const selectedDate = pickup.proposedDates.id(dateId);
        if (!selectedDate) {
            return res.status(404).json({ error: 'Proposed date not found' });
        }

        pickup.confirmedDate = {
            date: selectedDate.date,
            timeSlot: selectedDate.timeSlot
        };
        pickup.status = 'scheduled';
        await pickup.save();

        // Send confirmation email to agency
        const agency = await User.findOne({ username: pickup.receiver });
        if (agency) {
            await sendPickupConfirmationEmail(agency, {
                ...pickup.toObject(),
                donorName: req.user.name
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Pickup date confirmed successfully',
            pickup
        });

    } catch (error) {
        console.error('Error confirming pickup date:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

export const getPickupDetails = async (req, res) => {
    try {
        const pickup = await Pickup.findById(req.params.pickupId);

        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }

        // Verify that the user is either the donor or receiver
        if (pickup.donor !== req.user.username && pickup.receiver !== req.user.username) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Get both donor and receiver details
        const donorDetails = await getUserDetails(pickup.donor);
        const receiverDetails = await getUserDetails(pickup.receiver);

        res.json({
            success: true,
            pickup: {
                ...pickup.toObject(),
                donorDetails,
                receiverDetails
            }
        });
    } catch (error) {
        console.error('Error fetching pickup details:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const deleteQRCode = async (req, res) => {
    try {
        const { pickupId, qrCodeId } = req.params;

        const pickup = await Pickup.findById(pickupId);
        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }

        pickup.qrCodes = pickup.qrCodes.filter(qr => qr._id.toString() !== qrCodeId);
        await pickup.save();

        res.json({
            success: true,
            message: 'QR code deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting QR code:', error);
        res.status(500).json({ error: 'Server error' });
    }
};