import crypto from 'crypto';
import { sendEmail } from '../services/emailService.js';
import { getOTPTemplate } from '../mailTemplates/index.js';
import { validateOTP } from '../middleware/otpValidation.js';

// Export the OTP store so it can be used by the validation middleware
export const otpStore = new Map();

export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if user has exceeded resend limit
        const existingOTP = otpStore.get(email);
        if (existingOTP && existingOTP.attempts >= 2) {
            return res.status(400).json({ 
                error: 'Maximum OTP attempts reached. Please try again later.' 
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const expiryTime = Date.now() + (2 * 60 * 1000); // 2 minutes

        // Store OTP with attempts count
        otpStore.set(email, {
            otp,
            expiry: expiryTime,
            attempts: existingOTP ? existingOTP.attempts + 1 : 0
        });

        // Send OTP email
        const emailContent = getOTPTemplate({ otp, email });
        await sendEmail(
            email,
            'Document Resubmission OTP',
            emailContent
        );

        // Clean up OTP after expiry
        setTimeout(() => {
            otpStore.delete(email);
        }, 2 * 60 * 1000);

        res.json({ 
            success: true, 
            message: 'OTP sent successfully' 
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        // The validation is already done by middleware
        // Just send success response
        res.json({ 
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ 
            error: 'Failed to verify OTP' 
        });
    }
};

// Add cleanup interval to remove expired OTPs
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of otpStore.entries()) {
        if (now > data.expiry) {
            otpStore.delete(email);
        }
    }
}, 60000); // Clean up every minute
  