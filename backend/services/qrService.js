import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const QR_EXPIRY_TIME = 5 * 60; // 5 minutes in seconds

/**
 * Generates a QR code for a pickup
 * @param {string} pickupId - The ID of the pickup
 * @returns {string} - The encoded QR data
 */
export const generatePickupQR = async (pickupId) => {
    const token = jwt.sign(
        {
            pickupId,
            code: uuidv4(),
            timestamp: Date.now()
        },
        process.env.JWT_SECRET,
        { expiresIn: QR_EXPIRY_TIME }
    );
    return token;
};

/**
 * Verifies a QR code for a pickup
 * @param {string} qrData - The QR code data to verify
 * @param {Object} pickup - The pickup object
 * @returns {Object} - Verification result
 */
export const verifyQRCode = (qrData, pickup) => {
    try {
        const decoded = jwt.verify(qrData, process.env.JWT_SECRET);
        
        // Check if QR code matches pickup
        if (decoded.pickupId !== pickup._id.toString()) {
            return {
                valid: false,
                message: 'Invalid QR code for this pickup'
            };
        }

        return { valid: true, decoded };
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return {
                valid: false,
                message: 'QR code has expired. Please request a new one.'
            };
        }
        return {
            valid: false,
            message: 'Invalid QR code'
        };
    }
};

/**
 * Checks if a QR code has expired
 * @param {Object} qrCode - The QR code object
 * @returns {boolean} - True if expired
 */
export const isQRCodeExpired = (qrCode) => {
    if (!qrCode.expiresAt) return true;
    return new Date(qrCode.expiresAt) <= new Date();
};

/**
 * Cleans up expired QR codes for a pickup
 * @param {Object} pickup - The pickup object
 * @returns {Object} - Updated pickup object
 */
export const cleanupExpiredQRCodes = async (pickup) => {
    try {
        // Mark expired QR codes
        pickup.qrCodes.forEach(qr => {
            if (isQRCodeExpired(qr) && qr.status === 'active') {
                qr.status = 'expired';
            }
        });

        await pickup.save();
        return pickup;
    } catch (error) {
        console.error('Error cleaning up QR codes:', error);
        throw new Error('Failed to cleanup QR codes');
    }
}; 