import User from "../models/user.js";
import Points from "../models/userPoints.js";
import Agency from "../models/compostAgency.js";
import History from "../models/history.js";
import Transaction from "../models/transaction.js";
import Pickup from "../models/pickup.js";
import Notification from "../models/notification.js";
import { createNotification } from "../services/notificationService.js";
import { 
    sendDonationRequestEmail,
    sendDonationAcceptanceEmail,
    sendDonationRejectionEmail,
    sendDateProposalEmail,
    sendQRCodeRequestEmail,
    sendQRCodeGenerationEmail,
    sendPointsEarnedEmail,
    sendRewardRedemptionConfirmation,
    sendRewardRedemptionRequest,
    sendRewardApprovalEmail,
    sendRewardRejectionEmail,
    sendEmail,  // Add this import
    sendPickupConfirmationEmail
} from '../services/emailService.js';
import { 
    getDonationRequestEmail,  // Add this import
    getDonorRequestConfirmation,
    getAgencyDonationRequest 
} from '../mailTemplates/donationEmails.js';
import dotenv from 'dotenv';
import axios from 'axios';
import { generatePickupQR } from "../services/qrService.js";
dotenv.config();

export const nearby_agency = async (req, res) => {
    try {
        const userDoc = await User.findById(req.user.id);
        
        if (!userDoc) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Unable to find user profile'
            });
        }

        if (!userDoc.location || !userDoc.location.coordinates) {
            return res.status(422).json({
                error: 'Location not found',
                message: 'Please update your location in profile settings'
            });
        }

        const userLat = userDoc.location.coordinates.lat;
        const userLng = userDoc.location.coordinates.lon;
        
        if (isNaN(userLat) || isNaN(userLng)) {
            return res.status(422).json({
                error: 'Invalid location format',
                message: 'Your location coordinates are invalid. Please update them in your profile.'
            });
        }

        const role = req.params.role;
        if (!['ngo', 'compostAgency'].includes(role)) {
            return res.status(400).json({
                error: 'Invalid role',
                message: 'Role must be either ngo or compostAgency'
            });
        }

        // First check all users with this role
        let allUsers = await User.find({ role: role }).lean();
        console.log('All users with role:', role, ':', allUsers.map(u => ({
            username: u.username,
            location: u.location,
            verificationStatus: u.verificationStatus
        })));

        // Then add filters one by one to see which one is causing the issue
        let usersWithLocation = await User.find({ 
            role: role,
            'location.coordinates': { $exists: true }
        }).lean();
        console.log('Users with location:', usersWithLocation.map(u => ({
            username: u.username,
            location: u.location
        })));

        let verifiedUsers = await User.find({ 
            role: role,
            verificationStatus: 'approved'
        }).lean();
        console.log('Verified users:', verifiedUsers);

        let activeUsers = await User.find({ 
            role: role,
            status: { $ne: 'inactive' }
        }).lean();
        console.log('Active users:', activeUsers);

        // Original query
        let users = await User.find(
            { 
                role: role,
                'location.coordinates': { $exists: true },
                verificationStatus: 'approved',  
                status: { $ne: 'inactive' }  
            }, 
            { name: 1, username: 1, role: 1, location: 1, contact: 1, address: 1 }
        ).lean();

        console.log('Found users:', users);
        console.log('User searching from:', { lat: userLat, lng: userLng });

        let nearbyAgency = [];

        for (const user of users) {
            if (!user.location?.coordinates) {
                console.log('User missing coordinates:', user.username);
                continue;
            }

            const agencyLat = user.location.coordinates.lat;
            const agencyLng = user.location.coordinates.lon;
            
            console.log('Checking distance for:', user.username, { lat: agencyLat, lng: agencyLng });
            
            // Calculate distance using Haversine formula
            const R = 6371; // Earth's radius in km
            const dLat = (agencyLat - userLat) * Math.PI / 180;
            const dLon = (agencyLng - userLng) * Math.PI / 180;
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(userLat * Math.PI / 180) * Math.cos(agencyLat * Math.PI / 180) * 
                Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;

            console.log('Calculated distance:', distance, 'km');

            // If within 10km radius
            if (distance <= 10) {
                try {
                    const apiKey = process.env.TOMTOM_API_KEY;
                    const url = `https://api.tomtom.com/routing/1/calculateRoute/${userLat},${userLng}:${agencyLat},${agencyLng}/json?key=${apiKey}`;
                    
                    const response = await axios.get(url);
                    const route = response.data.routes?.[0];

                    if (route) {
                        nearbyAgency.push({
                            ...user,
                            distance: parseFloat((route.summary.lengthInMeters / 1000).toFixed(2)),
                            travelTime: Math.round(route.summary.travelTimeInSeconds / 60)
                        });
                    }
                } catch (error) {
                    console.error('Error calculating route:', error);
                    // Still add the agency even if route calculation fails
                    nearbyAgency.push({
                        ...user,
                        distance: parseFloat(distance.toFixed(2))
                    });
                }
            }
        }

        // Sort by distance
        nearbyAgency.sort((a, b) => a.distance - b.distance);

        res.json({
            success: true,
            nearbyAgency
        });
    } catch (error) {
        console.error('Error finding nearby agencies:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'Failed to find nearby agencies'
        });
    }
};

// Making a donation request to compost agency or ngo
export const donate_supplies = async (req, res) => {
    try {
        const { 
            username, 
            type: recipientType, 
            recipientEmail, 
            quantity,
            wasteType,
            itemType,
            itemCategory,
            itemName,
            description 
        } = req.body;

        // Validate recipient
        const recipient = await User.findOne({ 
            username, 
            role: recipientType,
            verificationStatus: 'approved' 
        });

        if (!recipient) {
            return res.status(404).json({
                success: false,
                error: 'Recipient not found or not verified'
            });
        }

        // Create transaction with proper enum values
        const transactionData = {
            sender: req.user.username,
            receiver: username,
            recipientEmail: recipientEmail || recipient.email,
            type: recipientType, // Use exact enum value: 'ngo' or 'compostAgency'
            quantity: Number(quantity) || 0,
            description: description || `Donation of ${quantity}kg ${wasteType || itemType || 'items'}`,
            status: 'pending'
        };

        // Add type-specific fields
        if (recipientType === 'ngo') {
            transactionData.itemCategory = itemCategory || 'surplus food'; // Use valid enum value
            if (itemCategory === 'others') {
                transactionData.itemName = itemName;
            }
        } else if (recipientType === 'compostAgency') {
            transactionData.wasteType = wasteType || 'food'; // Use valid enum value
            transactionData.itemType = itemType || 'organic waste';
        }

        const transaction = await Transaction.create(transactionData);

        // Create notification
        await createNotification({
            title: 'New Donation Request',
            message: `${req.user.username} has sent a donation request`,
            targetUser: username,
            type: 'donation',
            priority: 'medium',
            link: `/donations/${transaction._id}`,
            metadata: {
                transactionId: transaction._id,
                quantity: transactionData.quantity,
                itemType: transactionData.itemType || transactionData.wasteType
            }
        });

        // Get donor details
        const donor = await User.findById(req.user.id);

        // Send email to recipient (NGO/Agency)
        const recipientEmailContent = getAgencyDonationRequest(recipient, donor, {
            type: recipientType,
            wasteType: transactionData.wasteType,
            itemType: transactionData.itemType,
            itemCategory: transactionData.itemCategory,
            itemName: transactionData.itemName,
            quantity: transactionData.quantity,
            description: transactionData.description
        });

        await sendEmail(recipient.email, 'New Donation Request', recipientEmailContent);

        // Send confirmation email to donor
        const donorEmailContent = getDonorRequestConfirmation(donor, {
            ...transactionData,
            receiverName: recipient.name,
            type: recipientType
        });

        await sendEmail(donor.email, 'Donation Request Confirmation', donorEmailContent);

        res.json({
            success: true,
            message: 'Donation request sent successfully',
            transaction
        });

    } catch (error) {
        console.error('Error in donate_supplies:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to process donation'
        });
    }
};

// Displaying the list of agencies where user has donated from where he can get the reward
export const reward_store = async (req, res) => {
    try {
        // Get current user's points
        const userPoints = await Points.findOne({ user: req.user.username });
        if (!userPoints) {
            return res.status(200).json({ userRewards: [] });
        }

        let userRewards = [];
        
        // Get points from each agency/NGO for current user
        for (const pointEntry of userPoints.availablePoints) {
            const agencyDetails = await User.findOne(
                { username: pointEntry.agency },
                { username: 1, name: 1, role: 1 }
            );
            
            if (agencyDetails) {
                // Get agency rewards if available
                let agencyRewards = [];
                if (agencyDetails.role === 'compostAgency') {
                    const agencyData = await Agency.findOne({ user: agencyDetails.username });
                    agencyRewards = agencyData?.reward || [];
                }

                userRewards.push({
                    username: agencyDetails.username,
                    name: agencyDetails.name,
                    role: agencyDetails.role,
                    userPoints: pointEntry.points,
                    rewards: agencyRewards
                });
            }
        }

        return res.status(200).json({ userRewards });
    } catch (error) {
        console.log('Error:', error);
        return res.status(500).json({ error: 'Server Error' });
    }
};

// Reedem the reward and subtract the money
export const reedem_reward = async (req, res) => {
    try {
        const { reward, username } = req.body;
        
        // Validate reward points
        if (!reward.point || reward.point <= 0) {
            return res.status(400).json({ error: 'Invalid points amount' });
        }

        // 1. Get the agency/sender details
        let agency = await User.findOne({ username: username });
        if (!agency) {
            return res.status(404).json({ error: 'Agency not found' });
        }

        // 2. Get user's points document
        const pointsDoc = await Points.findOne({ user: req.user.username });
        if (!pointsDoc) {
            return res.status(404).json({ error: 'No points found' });
        }

        // 3. Find the agency points entry
        const agencyPointsIndex = pointsDoc.availablePoints.findIndex(
            ap => ap.agency === username
        );

        if (agencyPointsIndex === -1) {
            return res.status(404).json({ error: 'No points found for this agency' });
        }

        const currentPoints = pointsDoc.availablePoints[agencyPointsIndex].points;
        
        // Validate if user has enough points
        if (currentPoints < reward.point) {
            return res.status(400).json({ 
                error: 'Insufficient points',
                availablePoints: currentPoints 
            });
        }

        // 4. Update points using the correct path
        pointsDoc.availablePoints[agencyPointsIndex].points -= reward.point;
        
        // Ensure points don't go below 0
        if (pointsDoc.availablePoints[agencyPointsIndex].points < 0) {
            pointsDoc.availablePoints[agencyPointsIndex].points = 0;
        }
        
        await pointsDoc.save();

        // 5. Create history record - UPDATED
        await History.create({
            sender: username,         // Agency/NGO is the sender
            receiver: req.user.username,  // Donor is the receiver
            reward: {
                name: reward.name,
                point: reward.point
            },
            type: 'redeem'
        });

        // 6. Create notification

        await createNotification({
            title: 'Points reedemed successfully',
            message: `${req.user.username} has redeemed ${reward.point} points`,
            targetUser: username,
            type: 'points',
            link: `/donor/rewards`
        });

        // 7. Send email notification
        await sendRewardRedemptionConfirmation(agency, reward, agency);

        return res.status(200).json({ 
            message: "Reward redeemed successfully!",
            remainingPoints: currentPoints - reward.point,
            redeemedPoints: reward.point
        });

    } catch (error) {
        console.log('Error in redeem_reward:', error);
        return res.status(500).json({ 
            error: 'Server Error',
            details: error.message 
        });
    }
};

// Add this new function to get total points
export const getTotalPoints = async (req, res) => {
    try {
        const pointsDoc = await Points.findOne({ user: req.user.username });
        if (!pointsDoc) {
            return res.status(200).json({ totalPoints: 0, pointsByAgency: [] });
        }

        const pointsByAgency = pointsDoc.availablePoints.map(ap => ({
            agency: ap.agency,
            points: ap.points
        }));

        const totalPoints = pointsByAgency.reduce((sum, ap) => sum + ap.points, 0);

        return res.status(200).json({ totalPoints, pointsByAgency });
    } catch (error) {
        console.log('Error getting total points:', error);
        return res.status(500).json({ error: 'Server Error' });
    }
};

// Add this new function to get donor history
export const getDonorHistory = async (req, res) => {
    try {
        // Get all history records for the user
        const historyRecords = await History.find({
            $or: [
                { sender: req.user.username },
                { receiver: req.user.username }
            ],
            type: { $in: ['earn', 'redeem'] }
        }).sort({ createdAt: -1 });

        // Get completed pickups for the user
        const pickups = await Pickup.find({
            donor: req.user.username,
            status: 'completed'
        });

        // Create a map of completed pickups by date for quick lookup
        const pickupsMap = new Map();
        pickups.forEach(pickup => {
            const date = pickup.completedAt?.toISOString().split('T')[0];
            if (date) {
                if (!pickupsMap.has(date)) {
                    pickupsMap.set(date, []);
                }
                pickupsMap.get(date).push({
                    additionalPoints: pickup.additionalPoints || 0,
                    receiver: pickup.receiver
                });
            }
        });

        // Get agency details
        const agencyUsernames = historyRecords.map(record => 
            record.type === 'earn' ? record.sender : record.receiver
        );
        
        const agencies = await User.find(
            { username: { $in: agencyUsernames } },
            { username: 1, name: 1, role: 1 }
        );

        const agencyMap = agencies.reduce((acc, agency) => {
            acc[agency.username] = {
                name: agency.name,
                role: agency.role
            };
            return acc;
        }, {});

        // Calculate totals and format history records
        let totalEarned = 0;
        let totalRedeemed = 0;

        const formattedHistory = historyRecords.reduce((acc, record) => {
            const date = new Date(record.createdAt).toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = [];
            }

            const agencyInfo = agencyMap[record.type === 'earn' ? record.sender : record.receiver];
            const basePoints = record.reward.point;
            
            // Find additional points from pickups for this date and agency
            let additionalPoints = 0;
            if (record.type === 'earn') {
                const datePickups = pickupsMap.get(date) || [];
                const matchingPickup = datePickups.find(p => p.receiver === record.sender);
                additionalPoints = matchingPickup?.additionalPoints || 0;
            }

            const totalPoints = basePoints + additionalPoints;

            if (record.type === 'earn') {
                totalEarned += totalPoints;
            } else {
                totalRedeemed += basePoints;
            }

            acc[date].push({
                ...record.toObject(),
                agencyName: agencyInfo?.name || 'Unknown Agency',
                agencyRole: agencyInfo?.role || 'unknown',
                basePoints: basePoints,
                additionalPoints: additionalPoints,
                totalPoints: totalPoints
            });

            return acc;
        }, {});

        return res.status(200).json({
            message: 'History fetched successfully',
            history: formattedHistory,
            summary: {
                totalEarned,
                totalRedeemed,
                currentBalance: totalEarned - totalRedeemed
            }
        });
    } catch (error) {
        console.error('Error fetching donor history:', error);
        return res.status(500).json({ 
            error: 'Server Error',
            details: error.message 
        });
    }
};

// Add this new function to get donation requests
export const getDonationRequests = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            sender: req.user.username,
        }).sort({ createdAt: -1 });

        // Get all unique receiver usernames
        const receiverUsernames = [...new Set(transactions.map(t => t.receiver))];

        // Get receiver details
        const receivers = await User.find(
            { username: { $in: receiverUsernames } },
            { username: 1, name: 1, role: 1 }
        );

        const receiverInfo = receivers.reduce((acc, r) => {
            acc[r.username] = { name: r.name, role: r.role };
            return acc;
        }, {});

        // Group by date and enrich with receiver info
        const groupedTransactions = transactions.reduce((groups, transaction) => {
            const date = new Date(transaction.createdAt).toLocaleDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push({
                ...transaction.toObject(),
                receiverName: receiverInfo[transaction.receiver]?.name,
                receiverRole: receiverInfo[transaction.receiver]?.role
            });
            return groups;
        }, {});

        return res.status(200).json({
            message: 'Donation requests fetched successfully',
            donations: groupedTransactions
        });
    } catch (error) {
        console.error('Error fetching donation requests:', error);
        return res.status(500).json({ error: 'Server Error' });
    }
};

// Add this new function to get donor profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id, {
            name: 1,
            username: 1,
            email: 1,
            role: 1,
            location: 1,
            contact: 1,
            address: 1
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({
            message: 'Profile fetched successfully',
            user
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return res.status(500).json({ 
            error: 'Server Error',
            details: error.message 
        });
    }
};

export const getDonorPickups = async (req, res) => {
    try {
        const pickups = await Pickup.find({ 
            donor: req.user.username 
        }).sort({ createdAt: -1 }).lean();

        // Get receiver details for each pickup
        const pickupsWithDetails = await Promise.all(pickups.map(async pickup => {
            // Include location in receiver details
            const receiver = await User.findOne(
                { username: pickup.receiver },
                { 
                    name: 1, 
                    address: 1, 
                    contact: 1, 
                    location: 1, 
                    role: 1
                }
            ).lean();

            return {
                ...pickup,
                receiverDetails: receiver ? {
                    name: receiver.name,
                    address: receiver.address,
                    contact: receiver.contact,
                    location: receiver.location,
                    role: receiver.role
                } : null
            };
        }));

        res.json({
            success: true,
            pickups: pickupsWithDetails
        });
    } catch (error) {
        console.error('Error fetching donor pickups:', error);
        res.status(500).json({ error: 'Failed to fetch pickups' });
    }
};

export const getDonorPickupDetails = async (req, res) => {
    try {
        const pickup = await Pickup.findOne({
            _id: req.params.pickupId,
            donor: req.user.username
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

export const confirmPickupDate = async (req, res) => {
    try {
        const { pickupId } = req.params;
        const { date, timeSlot } = req.body;

        const pickup = await Pickup.findOne({
            _id: pickupId,
            donor: req.user.username,
            status: 'dates_proposed'
        });

        if (!pickup) {
            return res.status(404).json({
                success: false,
                error: 'Pickup not found or cannot be confirmed'
            });
        }

        // Validate that the date is one of the proposed dates
        const isValidDate = pickup.proposedDates.some(
            pd => new Date(pd.date).toISOString() === new Date(date).toISOString() && pd.timeSlot === timeSlot
        );

        if (!isValidDate) {
            return res.status(400).json({
                success: false,
                error: 'Selected date and time slot must be one of the proposed dates'
            });
        }

        // Update pickup with confirmed date
        pickup.confirmedDate = { date, timeSlot };
        pickup.status = 'scheduled';
        await pickup.save();

        // Get the receiver's role
        const receiver = await User.findOne({ username: pickup.receiver });
        const receiverRole = receiver?.role || 'ngo';
        const roleDisplay = receiverRole === 'ngo' ? 'NGO' : 'Compost Agency';
        const pickupLink = receiverRole === 'ngo' ? `/ngo/pickups/${pickup._id}` : `/agency/pickups/${pickup._id}`;

        // Notify the receiver
        await createNotification({
            title: 'Pickup Date Confirmed',
            message: `${req.user.username} has confirmed a pickup date: ${new Date(date).toLocaleDateString()} at ${timeSlot}`,
            targetUser: pickup.receiver,
            type: 'pickup',
            link: pickupLink
        });
        // Send email notification
        await sendPickupConfirmationEmail(receiver, pickup);

        res.json({
            success: true,
            message: 'Pickup date confirmed successfully',
            pickup
        });

    } catch (error) {
        console.error('Error confirming pickup date:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to confirm pickup date'
        });
    }
};

// Update donor profile with location
export const updateDonorProfile = async (req, res) => {
    try {
        const { name, username, email, role, contact, address, location } = req.body;
        const userId = req.user.id;

        // Validate location format (latitude,longitude)
        if (location) {
            const [lat, lng] = location.split(',').map(Number);
            if (isNaN(lat) || isNaN(lng) || 
                lat < -90 || lat > 90 || 
                lng < -180 || lng > 180) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid location format. Expected format: latitude,longitude'
                });
            }

            // Convert location string to object format for storage
            const locationObj = {
                coordinates: {
                    lat: lat,
                    lon: lng
                },
                address: address // Using the address from the request
            };

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    $set: {
                        name,
                        contact,
                        address,
                        location: locationObj
                    }
                },
                { new: true }
            ).select('-password -verificationDocument');

            if (!updatedUser) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Convert location back to string format for response
            const responseUser = updatedUser.toObject();
            if (responseUser.location?.coordinates) {
                responseUser.location = `${responseUser.location.coordinates.lat},${responseUser.location.coordinates.lon}`;
            }

            res.json({
                success: true,
                user: responseUser
            });
        }

    } catch (error) {
        console.error('Error updating donor profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile',
            details: error.message
        });
    }
};

// Get nearby pickup agencies
export const getNearbyAgencies = async (req, res) => {
    try {
        const { location } = req.query;
        if (!location) {
            return res.status(400).json({
                success: false,
                error: 'Location is required'
            });
        }

        const [userLat, userLng] = location.split(',').map(Number);

        // Find agencies within 10km radius
        const agencies = await User.find({
            role: 'compostAgency',
            verificationStatus: 'approved',
            status: { $ne: 'inactive' },
            location: { $exists: true }
        }).select('username name location');

        // Calculate distance and sort by proximity
        const agenciesWithDistance = agencies
            .map(agency => {
                if (!agency.location) return null;
                const [agencyLat, agencyLng] = agency.location.split(',').map(Number);
                const distance = calculateDistance(userLat, userLng, agencyLat, agencyLng);
                return { ...agency.toObject(), distance };
            })
            .filter(agency => agency && agency.distance <= 10) // 10km radius
            .sort((a, b) => a.distance - b.distance);

        res.json({
            success: true,
            agencies: agenciesWithDistance
        });

    } catch (error) {
        console.error('Error fetching nearby agencies:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch nearby agencies',
            details: error.message
        });
    }
};

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function toRad(value) {
    return value * Math.PI / 180;
}

// Generate QR code
export const generateQrCode = async (req, res) => {
    try {
        const { pickupId } = req.params;

        // Find pickup and verify ownership
        const pickup = await Pickup.findOne({
            _id: pickupId,
            donor: req.user.username
        });

        if (!pickup) {
            return res.status(404).json({
                success: false,
                error: 'Pickup not found or cannot generate QR code'
            });
        }

        // Check if pickup is in valid state
        if (pickup.status !== 'scheduled' || !pickup.lastQrRequestTime || !pickup.qrRequestedBy) {
            return res.status(400).json({
                success: false,
                error: 'QR code has not been requested yet or pickup is not in correct state'
            });
        }

        // Check if confirmed date exists
        if (!pickup.confirmedDate) {
            return res.status(400).json({
                success: false,
                error: 'Pickup date has not been confirmed yet'
            });
        }

        // Generate QR code data
        const qrData = {
            pickupId: pickup._id.toString(),
            donor: pickup.donor,
            receiver: pickup.receiver,
            timestamp: new Date().toISOString()
        };

        // Create QR code token
        const qrCode = await generatePickupQR(pickup._id.toString());

        // Update pickup status and save QR code
        pickup.qrCodes = pickup.qrCodes || [];
        pickup.qrCodes.push({
            code: qrCode,
            generatedAt: new Date(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
            status: 'active'
        });

        pickup.qrGenerationAttempts = (pickup.qrGenerationAttempts || 0) + 1;
        console.log(pickup);
        
        await pickup.save();
// console.log("pickup",pickup);


        // Get the receiver's role
        const receiver = await User.findOne({ username: pickup.receiver }, 'role');
        console.log("receiver",receiver);
        
        const receiverRole = receiver?.role || 'ngo';
        const roleDisplay = receiverRole === 'ngo' ? 'NGO' : 'Compost Agency';
        const pickupLink = receiverRole === 'ngo' ? `/ngo/pickups/${pickup._id}` : `/agency/pickups/${pickup._id}`;

        // Create notification for receiver
        await createNotification({
            title: 'QR Code Generated',
            message: `QR code has been generated for pickup #${pickup._id}`,
            targetUser: pickup.receiver,
            type: 'pickup',
            link: pickupLink
        });

        // Create notification for donor
        await createNotification({
            title: 'QR Code Generated',
            message: `You have generated a QR code for your pickup with ${roleDisplay} ${pickup.receiver}`,
            targetUser: pickup.donor,
            type: 'pickup',
            link: `/donor/pickups/${pickup._id}`
        });

        const donor=await User.findOne({username: pickup.donor})
        console.log("donor",donor);
        
        // Send email notification
        await sendQRCodeGenerationEmail(donor, {
            pickupId: pickup._id,
            confirmedDate: pickup.confirmedDate,
            wasteType: pickup.wasteType,
            quantity: pickup.quantity
        }, qrCode);

        res.json({
            success: true,
            qrCode: qrData,
            message: 'QR code generated successfully'
        });

    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate QR code'
        });
    }
};

// Accept QR code request
export const acceptQrRequest = async (req, res) => {
    try {
        const { pickupId } = req.params;

        const pickup = await Pickup.findOne({
            _id: pickupId,
            donor: req.user.username,
            status: 'qr_requested'
        });

        if (!pickup) {
            return res.status(404).json({
                success: false,
                error: 'Pickup not found or cannot accept QR request'
            });
        }

        // Update pickup status
        pickup.status = 'qr_accepted';
        pickup.qrRequestDetails.acceptedAt = new Date();
        await pickup.save();

        // Get the receiver's role
        const receiver = await User.findOne({ username: pickup.qrRequestDetails.requestedBy }, 'role');
        const receiverRole = receiver?.role || 'ngo';
        const roleDisplay = receiverRole === 'ngo' ? 'NGO' : 'Compost Agency';
        const pickupLink = receiverRole === 'ngo' ? `/ngo/pickups/${pickup._id}` : `/agency/pickups/${pickup._id}`;

        // Create notification for receiver
        await createNotification({
            title: 'QR Code Request Accepted',
            message: `${req.user.username} has accepted your QR code request for pickup #${pickup._id}`,
            targetUser: pickup.qrRequestDetails.requestedBy,
            type: 'qr_request_accepted',
            link: pickupLink
        });

        // Create notification for donor
        await createNotification({
            title: 'QR Code Request Accepted',
            message: `You have accepted the QR code request from ${roleDisplay} ${pickup.qrRequestDetails.requestedBy}`,
            targetUser: pickup.donor,
            type: 'pickup',
            link: `/donor/pickups/${pickup._id}`
        });

        // Send email notification
        await sendQRCodeRequestEmail(pickup.donor,{
            pickupId: pickup._id,
            confirmedDate: pickup.confirmedDate,
            wasteType: pickup.wasteType,
            quantity: pickup.quantity
        });

        res.json({
            success: true,
            message: 'QR request accepted successfully',
            pickup
        });

    } catch (error) {
        console.error('Error accepting QR request:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to accept QR request'
        });
    }
};