import User from '../models/user.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { secretKey } from '../config/jwtConfig.js';
import { sendEmail, sendWelcomeEmail } from '../services/emailService.js';
import { getPasswordResetEmail, getPasswordResetSuccessEmail } from '../mailTemplates/passwordReset.js';

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        // Save token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Send reset email
        const emailContent = getPasswordResetEmail(user, resetToken);
        await sendEmail(
            email,
            'Password Reset Request',
            emailContent
        );

        res.json({ 
            success: true, 
            message: 'Password reset email sent' 
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
export const verifyResetToken = async (req, res) => {
    const { token } = req.params;

    try {
        // Find user by reset token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }  // Check if token is not expired
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }

        res.json({ 
            success: true, 
            email: user.email  // Return user's email if token is valid
        });

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { username, role, password } = req.body;

        // If token is provided, handle token-based password reset
        if (token) {
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({ 
                    error: 'Invalid or expired reset token' 
                });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Update user
            user.password = hashedPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            // Send confirmation email
            const emailContent = getPasswordResetSuccessEmail(user);
            await sendEmail(
                user.email,
                'Password Reset Successful',
                emailContent
            );

            return res.json({ 
                success: true, 
                message: 'Password reset successful' 
            });
        }
        
        // Handle direct password reset for NGO and Compost Agency users
        if (!username || !role) {
            return res.status(400).json({ error: 'Username and role are required' });
        }

        if (role !== 'ngo' && role !== 'compostAgency') {
            return res.status(400).json({ error: 'Invalid role. Only NGO and Compost Agency passwords can be reset.' });
        }

        // Find the user
        const user = await User.findOne({ username, role });
        if (!user) {
            return res.status(404).json({ error: `${role === 'ngo' ? 'NGO' : 'Compost Agency'} user not found` });
        }

        // Set the default password
        const defaultPassword = 'user@1234';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        // Update user's password
        user.password = hashedPassword;
        user.mustChangePassword = true;
        await user.save();

        console.log('Password reset successful:', {
            username: user.username,
            role: user.role,
            passwordHash: hashedPassword.substring(0, 10) + '...',
            mustChangePassword: user.mustChangePassword
        });

        res.json({ 
            success: true, 
            message: `Password has been reset to the default value for ${user.role}` 
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};

export const verifyResubmissionToken = async (req, res) => {
    try {
        const { token } = req.params;
        
        // Verify token
        const decoded = jwt.verify(token, secretKey);
        console.log(decoded);
        
        // Get user details
        const user = await User.findOne({ 
            email: decoded.email,
            verificationStatus: 'rejected',
            submissionAttempts: { $lt: 3 }
        });

        if (!user) {
            return res.status(404).json({ error: 'Invalid or expired link' });
        }

        res.json({
            email: user.email,
            user: {
                verificationComments: user.verificationComments,
                submissionAttempts: user.submissionAttempts
            }
        });

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(400).json({ error: 'Invalid or expired link' });
    }
};

export const resubmitDocument = async (req, res) => {
    try {
        const { verifiedEmail } = req;
        
        if (!req.files || !req.files.document) {
            return res.status(400).json({ error: 'No document provided' });
        }

        const user = await User.findOne({ 
            email: verifiedEmail,
            verificationStatus: 'rejected',
            submissionAttempts: { $lt: 3 }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found or not eligible for resubmission' });
        }

        // Update user document with proper data URL format
        const file = req.files.document;
        const base64Data = file.data.toString('base64');
        
        user.verificationDocument = {
            data: `data:${file.mimetype};base64,${base64Data}`,  // Store with proper data URL format
            fileName: file.name,
            fileType: file.mimetype,
            uploadedAt: new Date()
        };
        
        user.verificationStatus = 'pending';
        user.submissionAttempts += 1;

        await user.save();

        // Notify admin about resubmission
        await sendEmail(
            process.env.ADMIN_EMAIL,
            'Document Resubmission Received',
            null,
            'admin-notification',
            `User ${user.username} has resubmitted verification document (Attempt ${user.submissionAttempts}/3)`
        );

        res.json({
            success: true,
            message: 'Document submitted successfully'
        });

    } catch (error) {
        console.error('Document resubmission error:', error);
        res.status(500).json({ error: 'Failed to submit document' });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password, role } = req.body;
        console.log('Login attempt:', { username, role, passwordLength: password?.length });

        // Find user without role first to see if they exist
        const anyUser = await User.findOne({ username });
        console.log('User found with username:', anyUser ? {
            id: anyUser._id,
            username: anyUser.username,
            actualRole: anyUser.role,
            requestedRole: role,
            verificationStatus: anyUser.verificationStatus,
            hasPassword: !!anyUser.password,
            mustChangePassword: anyUser.mustChangePassword
        } : 'No user found');

        // Find user with role
        const user = await User.findOne({ username, role });
        console.log('User found with username and role:', user ? {
            id: user._id,
            username: user.username,
            role: user.role,
            verificationStatus: user.verificationStatus,
            hasPassword: !!user.password,
            mustChangePassword: user.mustChangePassword
        } : 'No user found');

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // For NGO and compost agency users, check verification status
        if ((role === 'ngo' || role === 'compostAgency') && user.verificationStatus !== 'approved') {
            console.log('User not approved:', user.verificationStatus);
            return res.status(401).json({ 
                error: 'Your account is pending verification',
                verificationStatus: user.verificationStatus 
            });
        }

        // Check if password exists
        if (!user.password) {
            console.log('No password set for user');
            return res.status(401).json({ error: 'Please wait for admin verification and password setup' });
        }

        // Verify password using bcrypt compare
        console.log('Attempting password validation...');
        const isValidPassword = await bcrypt.compare(password, user.password);
        console.log('Password validation:', { 
            isValid: isValidPassword,
            providedPasswordLength: password?.length,
            storedPasswordLength: user.password?.length
        });
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { 
                id: user._id,
                username: user.username,
                role: user.role,
                name: user.name
            },
            secretKey,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                name: user.name,
                email: user.email,
                mustChangePassword: user.mustChangePassword
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const signup = async (req, res) => {
    try {
        console.log("Signup request received:", req.body);
        console.log("Files received:", req.files);

        let user = await User.findOne({ $or: [{ email: req.body.email }, { username: req.body.username }] });
        if (user) {
            return res.status(409).json({ error: 'User already exists!' });
        }

        // Create base user data
        const userData = {
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            role: req.body.role,
            isVerified: req.body.role === 'donor',
            verificationStatus: req.body.role === 'donor' ? 'approved' : 'pending',
            mustChangePassword: req.body.role !== 'donor'
        };

        // Set password based on role
        if (req.body.role === 'donor') {
            // For donors, use their provided password
            if (!req.body.password) {
                return res.status(400).json({ error: 'Password is required for donor registration' });
            }
            userData.password = await bcrypt.hash(req.body.password, 10);
        } else {
            // For NGO and compost agency, set default password
            const defaultPassword = 'user@1234';
            userData.password = await bcrypt.hash(defaultPassword, 10);
            userData.mustChangePassword = true;
        }

        // Handle verification document for NGO and CompostAgency
        if (req.body.role !== 'donor') {
            if (!req.files?.verificationDocument) {
                return res.status(400).json({ 
                    error: 'A valid verification document is required for NGO and Agency registration' 
                });
            }

            const file = req.files.verificationDocument;
            
            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (!allowedTypes.includes(file.mimetype)) {
                return res.status(400).json({
                    error: 'Invalid file type. Please upload a PDF, JPEG, or PNG file.'
                });
            }

            try {
                // Generate encryption key (32 bytes) and IV (16 bytes)
                const encryptionKey = crypto.randomBytes(32);
                const iv = crypto.randomBytes(16);

                // Create cipher
                const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);

                // Encrypt file data
                const encryptedBuffer = Buffer.concat([
                    cipher.update(file.data),
                    cipher.final()
                ]);

                console.log('Encryption details:', {
                    keyLength: encryptionKey.length,
                    ivLength: iv.length,
                    originalSize: file.data.length,
                    encryptedSize: encryptedBuffer.length
                });

                // Store encryption details
                userData.verificationDocument = {
                    data: encryptedBuffer,
                    fileName: file.name,
                    fileType: file.mimetype,
                    encryptionKey: encryptionKey.toString('hex'),
                    iv: iv.toString('hex'),
                    uploadedAt: new Date(),
                    status: 'pending'
                };

                // Add to document history
                userData.documentHistory = [{
                    data: encryptedBuffer,
                    fileName: file.name,
                    fileType: file.mimetype,
                    uploadedAt: new Date(),
                    status: 'pending',
                    encryptionKey: encryptionKey.toString('hex'),
                    iv: iv.toString('hex'),
                    submissionNumber: 1
                }];

            } catch (error) {
                console.error('Error encrypting document:', error);
                return res.status(500).json({ error: 'Failed to process verification document' });
            }
        }

        // Create and save user
        user = new User(userData);
        await user.save();
        console.log('User saved successfully:', {
            username: user.username,
            email: user.email,
            role: user.role
        });

        // Send welcome email only for donors
        // NGOs and Compost Agencies will receive email after admin verification
        // if (user.role === 'donor') {
            try {
                console.log('Starting welcome email process for donor:', user.email);
                await sendWelcomeEmail(user);
                console.log('Welcome email sent successfully to donor');
            } catch (error) {
                console.error('Error sending welcome email:', {
                    error: error.message,
                    stack: error.stack,
                    user: user.email
                });
            }
        // }

        res.status(201).json({ 
            success: true,
            message: user.role === 'donor' 
                ? 'Registration successful! You can now log in.'
                : 'Registration successful! Please wait for admin verification.',
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
};

export const resetUserPassword = async (req, res) => {
    try {
        const { username, role } = req.body;
        
        if (!username || !role) {
            return res.status(400).json({ error: 'Username and role are required' });
        }

        if (role !== 'ngo' && role !== 'compostAgency') {
            return res.status(400).json({ error: 'Invalid role. Only NGO and Compost Agency passwords can be reset.' });
        }

        // Find the user
        const user = await User.findOne({ username, role });
        if (!user) {
            return res.status(404).json({ error: `${role === 'ngo' ? 'NGO' : 'Compost Agency'} user not found` });
        }

        // Set the default password
        const defaultPassword = 'user@1234';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        // Update user's password
        user.password = hashedPassword;
        user.mustChangePassword = true;
        await user.save();

        console.log('Password reset successful:', {
            username: user.username,
            role: user.role,
            passwordHash: hashedPassword.substring(0, 10) + '...',
            mustChangePassword: user.mustChangePassword
        });

        res.json({ 
            success: true, 
            message: `Password has been reset to the default value for ${user.role}` 
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id; // From auth middleware

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Validate new password
        if (currentPassword === newPassword) {
            return res.status(400).json({ error: 'New password must be different from current password' });
        }

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.mustChangePassword = false; // Clear the flag after password change
        await user.save();

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const previewDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { isHistorical, historyIndex } = req.body;
        const user = await User.findById(req.user.id);

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

        // Convert the base64 string back to buffer if needed
        const documentData = Buffer.isBuffer(document.data) ? 
            document.data : 
            Buffer.from(document.data, 'base64');

        // If document is already in base64 data URL format, send it directly
        if (document.data.startsWith('data:')) {
            res.json({
                success: true,
                data: document.data,
                fileType: document.fileType
            });
            return;
        }

        // Otherwise convert buffer to base64 and send
        const base64Data = documentData.toString('base64');
        const fileType = document.fileType || 'application/pdf';

        res.json({
            success: true,
            data: `data:${fileType};base64,${base64Data}`,
            fileType: fileType
        });

    } catch (error) {
        console.error('Error in document preview:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to preview document',
            details: error.message
        });
    }
};
export const setNewPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Clear reset token fields (optional)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        // Save updated user
        await user.save();

        res.json({ 
            success: true, 
            message: 'Password reset successfully' 
        });

    } catch (error) {
        console.error('Set new password error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};