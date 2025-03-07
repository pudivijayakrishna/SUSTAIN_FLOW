import express from 'express';
import * as authController from '../controller/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { getProfile, updateProfile } from '../controller/profile.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { secretKey } from '../config/jwtConfig.js';
import { sendOTP, verifyOTP } from '../controller/otpController.js';
import { validateOTP } from '../middleware/otpValidation.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

dotenv.config();

const router = express.Router();

// Auth routes
router.post('/signup', async (req, res) => {
    console.log('Signup request received:', {
        username: req.body.username,
        role: req.body.role,
        hasPassword: !!req.body.password,
        email: req.body.email,
        name: req.body.name
    });
    
    try {
        // Check if we're connected to the right database
        const mongoose = (await import('mongoose')).default;
        console.log('MongoDB connection state:', mongoose.connection.readyState);
        
        await authController.signup(req, res);
    } catch (error) {
        console.error('Error in signup route:', error);
        res.status(500).json({ error: 'Signup failed' });
    }
});

router.post('/login', authController.login);

// Profile routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

// OTP routes for document resubmission
router.post('/send-otp', async (req, res) => {
    try {
        await sendOTP(req, res);
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

router.post('/verify-otp', validateOTP, async (req, res) => {
    try {
        await verifyOTP(req, res);
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

// Resubmission token verification route
router.get('/verify-resubmission/:token', authController.verifyResubmissionToken);
router.get('/verify-reset-token/:token', authController.verifyResetToken);

// Document history route
router.get('/document-history/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, secretKey);
        
        const user = await User.findOne({ 
            username: decoded.username,
            email: decoded.email 
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get document history and current document
        let documents = [];
        
        // Add current verification document if it exists
        if (user.verificationDocument) {
            documents.push({
                _id: user.verificationDocument._id,
                status: user.verificationStatus || 'pending',
                comment: user.verificationDocument.comment,
                date: user.verificationDocument.uploadedAt,
                fileName: user.verificationDocument.fileName,
                fileType: user.verificationDocument.fileType
            });
        }

        // Add historical documents if they exist, excluding duplicates
        if (user.documentHistory && user.documentHistory.length > 0) {
            const seenDocIds = new Set(documents.map(doc => doc._id.toString()));
            
            user.documentHistory.forEach(doc => {
                const docId = doc._id.toString();
                if (!seenDocIds.has(docId)) {
                    seenDocIds.add(docId);
                    documents.push({
                        _id: doc._id,
                        status: doc.status,
                        comment: doc.comment || doc.rejectionReason,
                        date: doc.uploadedAt || doc.date,
                        fileName: doc.fileName,
                        fileType: doc.fileType
                    });
                }
            });
        }

        // Sort documents by date in descending order
        documents.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            documents: documents.map((doc, index) => ({
                id: doc._id.toString(),
                documentId: doc._id.toString(),
                status: doc.status,
                comment: doc.comment,
                date: doc.date,
                fileName: doc.fileName,
                fileType: doc.fileType,
                historyIndex: index
            }))
        });
    } catch (error) {
        console.error('Document history error:', error);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});

// Document resubmission route
router.post('/resubmit-document/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, secretKey);
        
        // Find user
        const user = await User.findOne({ 
            username: decoded.username,
            email: decoded.email 
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if files were uploaded
        if (!req.files || !req.files.document) {
            console.log('No files received:', req.files);
            return res.status(400).json({ error: 'No document uploaded' });
        }

        const document = req.files.document;
        console.log('Received document:', {
            name: document.name,
            size: document.size,
            type: document.mimetype
        });

        // Validate file type
        if (document.mimetype !== 'application/pdf') {
            return res.status(400).json({ error: 'Only PDF files are allowed' });
        }

        // Validate file size (5MB limit)
        if (document.size > 5 * 1024 * 1024) {
            return res.status(400).json({ error: 'File size should not exceed 5MB' });
        }

        // Generate encryption key and IV
        const encryptionKey = crypto.randomBytes(32);
        const iv = crypto.randomBytes(16);

        // Create cipher and encrypt data
        const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
        const encryptedBuffer = Buffer.concat([
            cipher.update(document.data),
            cipher.final()
        ]);

        // Store document history
        if (!user.documentHistory) {
            user.documentHistory = [];
        }

        // Add current document to history if exists
        if (user.verificationDocument) {
            user.documentHistory.push({
                ...user.verificationDocument.toObject(),
                status: 'replaced',
                date: new Date()
            });
        }

        // Update user's document with encryption details
        user.verificationDocument = {
            data: encryptedBuffer,
            fileName: document.name,
            fileType: document.mimetype,
            uploadedAt: new Date(),
            encryptionKey: encryptionKey.toString('hex'),
            iv: iv.toString('hex')
        };
        user.verificationStatus = 'pending';

        await user.save();

        console.log('Document saved successfully for user:', user.username);

        res.json({
            success: true,
            message: 'Document submitted successfully'
        });
    } catch (error) {
        console.error('Document resubmission error:', error);
        res.status(500).json({ 
            error: 'Failed to resubmit document',
            details: error.message
        });
    }
});

// TomTom API key route
router.get('/getTomTomApiKey', authMiddleware, (req, res) => {
    try {
        const apiKey = process.env.TOMTOM_API_KEY;
        if (!apiKey) {
            throw new Error('TomTom API key not configured');
        }
        res.json({ 
            success: true,
            apiKey: apiKey 
        });
    } catch (error) {
        console.error('Error fetching TomTom API key:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch API key',
            details: error.message
        });
    }
});

// Password validation function
const validatePassword = (password) => {
    if (!password) return ['Password is required'];
    
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) {
        errors.push('Password must be at least 8 characters long');
    }
    if (!hasUpperCase) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
        errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
        errors.push('Password must contain at least one special character');
    }

    return errors;
};

// Change password route
router.post('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        // Check if passwords are provided
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                error: 'Both current password and new password are required'
            });
        }

        // Get user from database using the id from auth middleware
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate new password
        const passwordErrors = validatePassword(newPassword);
        if (passwordErrors.length > 0) {
            return res.status(400).json({ 
                error: 'Invalid password',
                details: passwordErrors
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Check if new password is same as current
        if (currentPassword === newPassword) {
            return res.status(400).json({ error: 'New password must be different from current password' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and reset mustChangePassword flag
        user.password = hashedPassword;
        if (user.mustChangePassword) {
            user.mustChangePassword = false;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            error: 'Failed to change password',
            details: error.message
        });
    }
});

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password-token/:token', authController.resetPassword);
router.post('/setnewpassword', authController.setNewPassword);
router.post('/reset-user-password', async (req, res) => {
    try {
        await authController.resetPassword(req, res);
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Remove the duplicate route definition and keep only this one
router.post('/preview-document/:documentId', async (req, res) => {
    try {
        const { documentId } = req.params;
        const { isHistorical, historyIndex, token } = req.body;

        let user;
        
        if (token) {
            // If token is provided, verify it and get user
            const decoded = jwt.verify(token, secretKey);
            user = await User.findOne({ 
                email: decoded.email,
                verificationStatus: 'rejected'
            });
        } else if (req.user) {
            // If authenticated request
            user = await User.findById(req.user.id);
        }

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        let document;
        if (isHistorical && user.documentHistory && user.documentHistory.length > 0) {
            document = user.documentHistory[historyIndex];
        } else {
            document = user.verificationDocument;
        }

        if (!document?.data) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Check encryption details
        if (!document.encryptionKey || !document.iv) {
            console.error('Missing encryption details:', {
                hasKey: !!document.encryptionKey,
                hasIV: !!document.iv,
                userId: user._id
            });
            return res.status(500).json({ error: 'Missing encryption details' });
        }

        // Decrypt document using the same logic as adminController
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
        console.error('Document preview error:', error);
        res.status(500).json({ 
            error: 'Failed to preview document',
            details: error.message
        });
    }
});

// Add this route after other routes
router.post('/decrypt-document', async (req, res) => {
    try {
        const { userId, isHistorical, historyIndex } = req.body;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let document;
        if (isHistorical && user.documentHistory && user.documentHistory.length > 0) {
            document = user.documentHistory[historyIndex];
        } else {
            document = user.verificationDocument;
        }

        if (!document?.data) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // If document is already in base64 data URL format, send it directly
        if (typeof document.data === 'string' && document.data.startsWith('data:')) {
            return res.json({
                success: true,
                data: document.data,
                fileName: document.fileName,
                fileType: document.fileType
            });
        }

        // Convert buffer to base64
        const base64Data = Buffer.isBuffer(document.data) ? 
            document.data.toString('base64') : 
            Buffer.from(document.data).toString('base64');

        const fileType = document.fileType || 'application/pdf';

        res.json({
            success: true,
            data: `data:${fileType};base64,${base64Data}`,
            fileName: document.fileName,
            fileType: fileType
        });

    } catch (error) {
        console.error('Document decryption error:', error);
        res.status(500).json({ 
            error: 'Failed to decrypt document',
            details: error.message
        });
    }
});

export default router;