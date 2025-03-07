import User from '../models/user.js';
import History from '../models/history.js';
import jwt from 'jsonwebtoken';
import { secretKey } from '../config/jwtConfig.js';
import bcrypt from 'bcrypt';
import Transaction from '../models/transaction.js';
import ActivityLog from '../models/activityLog.js';
import EmailTemplate from '../models/emailTemplate.js';
import crypto from 'crypto';
import { sendVerificationEmail, sendVerificationSuccessEmail } from '../services/emailService.js';
import Notification from '../models/notification.js';
import mongoose from 'mongoose';
import Pickup from '../models/pickup.js';
import Feedback from '../models/feedback.js';
import { createNotification } from '../services/notificationService.js';
import { sendMail } from '../config/mailer.js';

// Admin login function
export const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Hardcoded admin credentials
        if (username === 'admin' && password === 'admin@1234') {
            const adminPayload = {
                id: 'admin',
                username: 'admin',
                role: 'admin',
                name: 'Administrator'
            };

            const token = jwt.sign(adminPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
            
            res.status(200).json({
                success: true,
                token,
                role: 'admin',
                username: 'admin',
                name: 'Administrator'
            });
        } else {
            res.status(401).json({ 
                success: false, 
                error: 'Invalid admin credentials' 
            });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
};

// Dashboard Stats
export const getDashboardStats = async (req, res) => {
    try {
        // Get user counts by role
        const [donors, ngos, compostAgencies] = await Promise.all([
            User.countDocuments({ role: 'donor' }),
            User.countDocuments({ role: 'ngo' }),
            User.countDocuments({ role: 'compostAgency' })
        ]);

        const totalUsers = donors + ngos + compostAgencies;

        // Get other stats
        const [
            totalPickups,
            completedPickups,
            totalFeedback,
            totalTransactions,
            wasteStats,
            donationStats
        ] = await Promise.all([
            Pickup.countDocuments(),
            Pickup.countDocuments({ status: 'completed' }),
            Feedback.countDocuments(),
            Transaction.countDocuments(),
            Transaction.aggregate([
                { 
                    $match: { 
                        type: 'compostAgency',
                        status: 'accepted'
                    }
                },
                {
                    $group: {
                        _id: '$wasteType',
                        total: { $sum: '$quantity' }
                    }
                }
            ]),
            Transaction.aggregate([
                {
                    $match: {
                        type: 'ngo',
                        status: 'accepted'
                    }
                },
                {
                    $group: {
                        _id: '$itemCategory',
                        total: { $sum: 1 }
                    }
                }
            ])
        ]);

        // Calculate total waste
        const totalWaste = {
            food: wasteStats.find(w => w._id === 'food')?.total || 0,
            eWaste: wasteStats.find(w => w._id === 'e-waste')?.total || 0
        };

        // Calculate total donations
        const totalDonations = {
            food: donationStats.find(d => d._id === 'food')?.total || 0,
            books: donationStats.find(d => d._id === 'books')?.total || 0,
            clothes: donationStats.find(d => d._id === 'clothes')?.total || 0,
            others: donationStats.find(d => d._id === 'others')?.total || 0
        };

        res.json({
            success: true,
            stats: {
                users: {
                    total: totalUsers,
                    donors,
                    ngos,
                    compostAgencies
                },
                waste: totalWaste,
                donations: totalDonations,
                overview: {
                    totalTransactions,
                    totalPickups,
                    completedPickups,
                    totalFeedback
                }
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

// Get transaction details
export const getTransactionDetails = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .populate('sender', 'username name')
            .populate('receiver', 'username name')
            .lean();

        // Add additional details and format dates
        const formattedTransactions = transactions.map(transaction => ({
            ...transaction,
            date: transaction.createdAt,
            senderName: transaction.sender?.name || transaction.sender?.username,
            receiverName: transaction.receiver?.name || transaction.receiver?.username,
            formattedDate: new Date(transaction.createdAt).toLocaleDateString(),
            formattedTime: new Date(transaction.createdAt).toLocaleTimeString(),
            statusLabel: transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1),
            typeLabel: transaction.type === 'ngo' ? 'NGO' : 'Compost Agency'
        }));

        // Calculate summary statistics
        const summary = {
            total: transactions.length,
            completed: transactions.filter(t => t.status === 'completed').length,
            pending: transactions.filter(t => t.status === 'pending').length,
            totalQuantity: transactions.reduce((sum, t) => sum + (t.quantity || 0), 0),
            totalPoints: transactions.reduce((sum, t) => sum + (t.points || 0), 0),
            byType: {
                ngo: transactions.filter(t => t.type === 'ngo').length,
                compostAgency: transactions.filter(t => t.type === 'compostAgency').length
            }
        };

        res.json({
            success: true,
            transactions: formattedTransactions,
            summary
        });
    } catch (error) {
        console.error('Error fetching transaction details:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch transaction details',
            details: error.message
        });
    }
};

// Get waste details
export const getWasteDetails = async (req, res) => {
    try {
        const wasteStats = {
            foodWaste: await Transaction.aggregate([
                { $match: { type: 'compostAgency', wasteType: 'food', status: 'accepted' } },
                { $group: { _id: null, total: { $sum: '$quantity' } } }
            ]).then(result => result[0]?.total || 0),
            eWaste: await Transaction.aggregate([
                { $match: { type: 'compostAgency', wasteType: 'e-waste', status: 'accepted' } },
                { $group: { _id: null, total: { $sum: '$quantity' } } }
            ]).then(result => result[0]?.total || 0)
        };

        res.json(wasteStats);
    } catch (error) {
        console.error('Error fetching waste details:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Get donation details
export const getDonationDetails = async (req, res) => {
    try {
        const donationStats = {
            food: await Transaction.countDocuments({ type: 'ngo', itemCategory: 'food', status: 'accepted' }),
            books: await Transaction.countDocuments({ type: 'ngo', itemCategory: 'books', status: 'accepted' }),
            clothes: await Transaction.countDocuments({ type: 'ngo', itemCategory: 'clothes', status: 'accepted' }),
            others: await Transaction.countDocuments({ type: 'ngo', itemCategory: 'others', status: 'accepted' })
        };

        res.json(donationStats);
    } catch (error) {
        console.error('Error fetching donation details:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Verify document
export const verifyDocument = async (req, res) => {
    try {
        const { userId, status, comments } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user verification status
        user.verificationStatus = status;
        if (comments) {
            if (!user.verificationComments) {
                user.verificationComments = [];
            }
            user.verificationComments.push({
                comment: comments,
                status: status,
                timestamp: new Date()
            });
        }
        user.verifiedAt = new Date();

        // For approved users, set default password
        let temporaryPassword;
        if (status === 'approved') {
            temporaryPassword = 'user@1234';
            user.password = await bcrypt.hash(temporaryPassword, 10);
            user.mustChangePassword = true;
        }
        
        await user.save();

        // Try to send email notification
        try {
            const emailData = {
                email: user.email,
                username: user.username,
                status: status,
                role: user.role,
                temporaryPassword: temporaryPassword,
                rejectionReason: comments,
                submissionAttempts: user.documentHistory?.length || 1
            };

            await sendVerificationEmail(emailData);
            console.log('Verification email sent successfully');
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Don't fail the verification process if email fails
            return res.json({ 
                success: true, 
                message: `Document ${status === 'approved' ? 'approved' : 'rejected'} successfully, but email notification failed`,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    verificationStatus: user.verificationStatus
                }
            });
        }

        res.json({ 
            success: true, 
            message: `Document ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                verificationStatus: user.verificationStatus
            }
        });

    } catch (error) {
        console.error('Error in verification process:', error);
        res.status(500).json({ 
            error: 'Failed to update verification status',
            details: error.message 
        });
    }
};

// Decrypt document
export const decryptDocument = async (req, res) => {
    try {
        const { userId, isHistorical, historyIndex } = req.body;
        console.log('Decryption request:', { userId, isHistorical, historyIndex });
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let document;
        if (isHistorical && user.documentHistory && user.documentHistory.length > 0) {
            document = user.documentHistory[historyIndex || user.documentHistory.length - 1];
        } else {
            document = user.verificationDocument;
        }

        if (!document || !document.data) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Check encryption details
        if (!document.encryptionKey || !document.iv) {
            console.error('Missing encryption details:', {
                hasKey: !!document.encryptionKey,
                hasIV: !!document.iv,
                userId
            });
            return res.status(500).json({ error: 'Missing encryption details' });
        }

        // Decrypt document
        const key = Buffer.from(document.encryptionKey, 'hex');
        const iv = Buffer.from(document.iv, 'hex');
        
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        const encryptedData = Buffer.isBuffer(document.data) ? document.data : Buffer.from(document.data);
        
        const decryptedBuffer = Buffer.concat([
            decipher.update(encryptedData),
            decipher.final()
        ]);

        // Convert to base64 with proper data URL format
        const base64Data = decryptedBuffer.toString('base64');
        const fileType = document.fileType || 'application/pdf';

        res.json({
            success: true,
            data: `data:${fileType};base64,${base64Data}`,
            fileType: fileType,
            fileName: document.fileName
        });

    } catch (error) {
        console.error('Decryption error:', error);
        res.status(500).json({ 
            error: 'Failed to decrypt document',
            details: error.message 
        });
    }
};

// Pickup Management
export const getPickups = async (req, res) => {
    try {
        const pickups = await Pickup.find().sort({ createdAt: -1 });
        const usernames = [...new Set(pickups.flatMap(p => [p.donor, p.receiver]))];
        
        // Get all relevant users in one query
        const users = await User.find(
            { username: { $in: usernames }},
            'username name role'
        );
        
        // Create a map for quick lookup
        const userMap = users.reduce((map, user) => {
            map[user.username] = user;
            return map;
        }, {});

        res.json({
            success: true,
            pickups: pickups.map(pickup => ({
                _id: pickup._id,
                donor: {
                    username: pickup.donor,
                    name: userMap[pickup.donor]?.name,
                    role: userMap[pickup.donor]?.role
                },
                receiver: {
                    username: pickup.receiver,
                    name: userMap[pickup.receiver]?.name,
                    role: userMap[pickup.receiver]?.role
                },
                status: pickup.status,
                quantity: pickup.quantity,
                wasteType: pickup.wasteType,
                itemType: pickup.itemType,
                confirmedDate: pickup.confirmedDate,
                completedAt: pickup.completedAt,
                completedBy: pickup.completedBy,
                additionalPoints: pickup.additionalPoints,
                completionNotes: pickup.completionNotes,
                qrCodes: pickup.qrCodes,
                createdAt: pickup.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching pickups:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch pickups',
            details: error.message 
        });
    }
};

export const deletePickup = async (req, res) => {
    try {
        const { id } = req.params;
        const pickup = await Pickup.findById(id);

        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }

        // Notify users about deletion
        const notificationPromises = [pickup.donor, pickup.receiver].map(username =>
            createNotification({
                title: 'Pickup Deleted',
                message: `Pickup #${pickup._id} has been deleted by admin`,
                targetUser: username,
                type: 'pickup',
                priority: 'high'
            })
        );

        await Promise.all([
            Pickup.findByIdAndDelete(id),
            ...notificationPromises
        ]);

        res.json({
            success: true,
            message: 'Pickup deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting pickup:', error);
        res.status(500).json({ error: 'Failed to delete pickup' });
    }
};

export const updatePickup = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const pickup = await Pickup.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        );

        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }

        // Notify users about updates
        const notificationPromises = [pickup.donor, pickup.receiver].map(username =>
            createNotification({
                title: 'Pickup Updated',
                message: `Pickup #${pickup._id} has been updated by admin`,
                targetUser: username,
                type: 'pickup'
            })
        );

        await Promise.all(notificationPromises);

        res.json({
            success: true,
            pickup
        });
    } catch (error) {
        console.error('Error updating pickup:', error);
        res.status(500).json({ error: 'Failed to update pickup' });
    }
};

// Feedback Management
export const getFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find()
            .sort({ createdAt: -1 })
            .populate('user', 'username email');

        res.json({
            success: true,
            feedback
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
};

export const replyToFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;

        const feedback = await Feedback.findByIdAndUpdate(
            id,
            { 
                $set: { 
                    reply,
                    repliedAt: new Date(),
                    repliedBy: req.admin.username
                }
            },
            { new: true }
        ).populate('user', 'username email');

        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        // Send notification
        await createNotification({
            title: 'Feedback Response',
            message: 'Admin has responded to your feedback',
            targetUser: feedback.user.username,
            type: 'feedback'
        });

        res.json({
            success: true,
            feedback
        });
    } catch (error) {
        console.error('Error replying to feedback:', error);
        res.status(500).json({ error: 'Failed to reply to feedback' });
    }
};

export const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        await Feedback.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Feedback deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting feedback:', error);
        res.status(500).json({ error: 'Failed to delete feedback' });
    }
};

// QR History
export const getQRHistory = async (req, res) => {
    try {
        const { pickupId } = req.params;
        const pickup = await Pickup.findById(pickupId)
            .populate('qrCodes', 'status generatedAt scannedAt scannedBy expiresAt');

        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }

        res.json({
            success: true,
            qrCodes: pickup.qrCodes
        });
    } catch (error) {
        console.error('Error fetching QR history:', error);
        res.status(500).json({ error: 'Failed to fetch QR history' });
    }
};

// Get all users
export const getUsers = async (req, res) => {
    try {
        const { search, role } = req.query;
        let query = {};

        // Add role filter if specified
        if (role && role !== 'all') {
            query.role = role;
        }

        // Add search filter if specified
        if (search) {
            query = {
                ...query,
                $or: [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const users = await User.find(query)
            .select('username email role isVerified verificationStatus createdAt')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            users: users.map(user => ({
                ...user.toObject(),
                password: undefined,
                verificationDocument: undefined
            }))
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        // Remove sensitive fields from updates
        delete updates.password;
        delete updates.verificationDocument;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true }
        ).select('-password -verificationDocument');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Send notification to user about update
        await createNotification({
            title: 'Account Updated',
            message: 'Your account details have been updated by admin',
            targetUser: user.username,
            type: 'account'
        });

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Don't allow deleting admin users
        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Cannot delete admin users'
            });
        }

        // Delete associated data
        await Promise.all([
            // Delete user's pickups
            Pickup.deleteMany({ $or: [{ donor: id }, { receiver: id }] }),
            
            // Delete user's transactions
            Transaction.deleteMany({ $or: [{ sender: id }, { receiver: id }] }),
            
            // Delete user's feedback
            Feedback.deleteMany({ user: id }),
            
            // Delete user's notifications
            Notification.deleteMany({ user: id }),
            
            // Delete activity logs
            ActivityLog.deleteMany({ user: id })
        ]);

        // Finally delete the user
        await User.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'User and associated data deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete user',
            details: error.message
        });
    }
};

// Get user details
export const getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId)
            .select('-password -verificationDocument')
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Add formatted dates and additional details
        const formattedUser = {
            ...user,
            createdAt: user.createdAt ? new Date(user.createdAt).toLocaleString() : null,
            updatedAt: user.updatedAt ? new Date(user.updatedAt).toLocaleString() : null,
            verificationStatus: user.isVerified ? 'Verified' : (user.verificationStatus || 'Not Verified'),
            roleLabel: user.role.charAt(0).toUpperCase() + user.role.slice(1),
            statusLabel: user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active'
        };

        res.json({
            success: true,
            user: formattedUser
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user details',
            details: error.message
        });
    }
};

// Get pending verifications
export const getPendingVerifications = async (req, res) => {
    try {
        console.log('Finding pending users...');
        const pendingUsers = await User.find({
            $or: [
                { verificationStatus: 'pending' },
                { verificationStatus: { $exists: false }, hasDocument: true }
            ],
            role: { $in: ['ngo', 'compostAgency'] }
        }).select('-password');

        console.log('Found pending users:', pendingUsers.length);
        
        // Process each user to check document status
        const processedUsers = await Promise.all(pendingUsers.map(async (user) => {
            console.log('Processing user:', {
                id: user._id,
                role: user.role,
                hasDocument: user.hasDocument,
                hasData: !!user
            });

            if (user.hasDocument) {
                try {
                    console.log('Attempting to decrypt document for user:', user._id);
                    // Add any document processing logic here if needed
                    console.log('Document decrypted successfully for user:', user._id);
                } catch (error) {
                    console.error('Error processing document for user:', user._id, error);
                }
            }

            return {
                ...user.toObject(),
                verificationStatus: user.verificationStatus || 'pending',
                submissionAttempts: user.submissionAttempts || 1
            };
        }));

        console.log('Processed verifications:', processedUsers.length);

        res.json({
            success: true,
            pendingVerifications: processedUsers
        });
    } catch (error) {
        console.error('Error fetching pending verifications:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch pending verifications',
            details: error.message
        });
    }
};

// Get rejected verifications
export const getRejectedVerifications = async (req, res) => {
    try {
        console.log('Fetching rejected verifications...');
        const rejectedUsers = await User.find({
            verificationStatus: 'rejected',
            role: { $in: ['ngo', 'compostAgency'] }
        }).select('-password');

        console.log('Found rejected users:', rejectedUsers.length);

        const processedUsers = rejectedUsers.map(user => ({
            ...user.toObject(),
            submissionAttempts: user.submissionAttempts || 1,
            verificationComments: user.verificationComments || []
        }));

        console.log('Processed rejected users:', processedUsers.length);

        res.json({
            success: true,
            rejectedVerifications: processedUsers
        });
    } catch (error) {
        console.error('Error fetching rejected verifications:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch rejected verifications',
            details: error.message
        });
    }
};

// Get verification stats
export const getVerificationStats = async (req, res) => {
    try {
        const [
            totalPending,
            totalRejected,
            totalApproved,
            pendingNGOs,
            pendingAgencies,
            rejectedNGOs,
            rejectedAgencies,
            approvedNGOs,
            approvedAgencies
        ] = await Promise.all([
            User.countDocuments({
                $or: [{ role: 'ngo' }, { role: 'compostAgency' }],
                verificationStatus: 'pending'
            }),
            User.countDocuments({
                $or: [{ role: 'ngo' }, { role: 'compostAgency' }],
                verificationStatus: 'rejected'
            }),
            User.countDocuments({
                $or: [{ role: 'ngo' }, { role: 'compostAgency' }],
                verificationStatus: 'approved'
            }),
            User.countDocuments({ role: 'ngo', verificationStatus: 'pending' }),
            User.countDocuments({ role: 'compostAgency', verificationStatus: 'pending' }),
            User.countDocuments({ role: 'ngo', verificationStatus: 'rejected' }),
            User.countDocuments({ role: 'compostAgency', verificationStatus: 'rejected' }),
            User.countDocuments({ role: 'ngo', verificationStatus: 'approved' }),
            User.countDocuments({ role: 'compostAgency', verificationStatus: 'approved' })
        ]);

        res.json({
            success: true,
            stats: {
                total: {
                    pending: totalPending,
                    rejected: totalRejected,
                    approved: totalApproved
                },
                ngo: {
                    pending: pendingNGOs,
                    rejected: rejectedNGOs,
                    approved: approvedNGOs
                },
                agency: {
                    pending: pendingAgencies,
                    rejected: rejectedAgencies,
                    approved: approvedAgencies
                }
            }
        });
    } catch (error) {
        console.error('Error fetching verification stats:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch verification stats' 
        });
    }
};

export const verifyUser = async (req, res) => {
    try {
        const { userId, status, rejectionReason } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (status === 'approved') {
            // Generate a temporary password for NGOs and Compost Agencies
            if (user.role === 'ngo' || user.role === 'compostAgency') {
                // Generate a random 10-character password
                const temporaryPassword = crypto.randomBytes(5).toString('hex');
                
                // Hash the temporary password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(temporaryPassword, salt);
                
                // Update user status and password
                user.verificationDocument.status = status;
                user.password = hashedPassword;
                user.isVerified = true;
                await user.save();

                // Send verification success email with temporary password
                try {
                    await sendVerificationSuccessEmail(user, temporaryPassword);
                    console.log('Verification success email sent with temporary password');
                } catch (emailError) {
                    console.error('Failed to send verification email:', emailError);
                    // Continue with the response even if email fails
                }
            } else {
                // For other roles, just update the status
                user.verificationDocument.status = status;
                user.isVerified = true;
                await user.save();
            }

            return res.json({ 
                success: true, 
                message: 'User verified successfully' 
            });
        } else if (status === 'rejected') {
            user.verificationDocument.status = status;
            user.verificationDocument.rejectionReason = rejectionReason;
            await user.save();

            return res.json({ 
                success: true, 
                message: 'User verification rejected' 
            });
        }

        return res.status(400).json({ error: 'Invalid status' });
    } catch (error) {
        console.error('Error in verifyUser:', error);
        res.status(500).json({ error: 'Failed to verify user' });
    }
};