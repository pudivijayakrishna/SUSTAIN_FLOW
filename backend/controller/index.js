import User from '../models/user.js';
import { generateToken } from '../config/jwtUtils.js';
import { sendWelcomeEmail, sendVerificationEmail } from '../services/emailService.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { secretKey } from '../config/jwtConfig.js';
import crypto from 'crypto';
import mongoose from 'mongoose';

// Profile controller
export const profile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update profile controller
export const update_profile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;

        await user.save();
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

// Change password controller
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash and update new password
        user.password = await bcrypt.hash(newPassword, 10);
        user.mustChangePassword = false;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
};

// Document resubmission functions
export const verifyResubmissionToken = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, secretKey);
        
        if (!decoded || !decoded.username || !decoded.email) {
            return res.status(400).json({ error: 'Invalid token' });
        }

        const user = await User.findOne({ username: decoded.username, email: decoded.email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ 
            valid: true,
            user: {
                username: user.username,
                email: user.email,
                remainingAttempts: 3 - (user.documentHistory?.length || 0)
            }
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};

export const getDocumentHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('documentHistory verificationStatus verificationComments')
            .lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            history: user.documentHistory || [],
            status: user.verificationStatus,
            comments: user.verificationComments
        });
    } catch (error) {
        console.error('Error fetching document history:', error);
        res.status(500).json({ error: 'Failed to fetch document history' });
    }
};
