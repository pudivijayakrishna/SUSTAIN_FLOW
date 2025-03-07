import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getProfile, updateProfile } from '../controller/profile.js';
import { validatePickupRequest } from '../middleware/validation.js';
import {
    proposeDates,
    confirmPickupDate,
    getPickups,
    deletePickup,
    requestQRCode,
    completePickup
} from '../controller/pickup.js';
import { validateQRRequest } from '../middleware/qrValidation.js';

const router = express.Router();

// Profile routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

// Pickup routes
router.post('/pickup/confirm-date/:pickupId', authMiddleware, confirmPickupDate);
router.get('/pickup', authMiddleware, getPickups);
router.delete('/pickup/:pickupId', authMiddleware, deletePickup);

// QR Code routes
router.post(
    '/pickup/request-qr/:pickupId',
    authMiddleware,
    validateQRRequest,
    async (req, res, next) => {
        try {
            await requestQRCode(req, res);
        } catch (error) {
            console.error('Route error:', error);
            next(error);
        }
    }
);

router.post(
    '/pickup/complete-qr',
    authMiddleware,
    completePickup
);

export default router; 