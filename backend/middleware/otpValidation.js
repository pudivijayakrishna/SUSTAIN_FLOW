import { otpStore } from '../controller/otpController.js';

export const validateOTP = (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: 'Email and OTP are required' });
        }

        const storedData = otpStore.get(email);
        if (!storedData) {
            return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
        }

        if (Date.now() > storedData.expiry) {
            otpStore.delete(email);
            return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // OTP is valid, clean it up
        otpStore.delete(email);
        next();
    } catch (error) {
        console.error('OTP validation error:', error);
        res.status(500).json({ error: 'Failed to validate OTP' });
    }
}; 