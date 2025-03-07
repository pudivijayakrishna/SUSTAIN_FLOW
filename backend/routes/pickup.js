import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { validateQRRequest, validateQRCompletion } from '../middleware/qrValidation.js';
import { validatePickupRequest } from '../middleware/validation.js';
import Pickup from '../models/pickup.js';
import { createNotification } from '../services/notificationService.js';
import {
    requestQRCode,
    generateQRCode,
    completePickup,
    proposeDates,
    confirmPickupDate,
    getPickups,
    deletePickup
} from '../controller/pickup.js';

const router = express.Router();

// QR Code related routes
router.post('/request-qr/:pickupId', authMiddleware, validateQRRequest, requestQRCode);
router.get('/generate-qr/:pickupId', authMiddleware, generateQRCode);
router.post('/complete', authMiddleware, validateQRCompletion, completePickup);

// Schedule routes
router.post('/propose-dates', authMiddleware, validatePickupRequest, proposeDates);
router.post('/confirm-date/:pickupId', authMiddleware, confirmPickupDate);

// Pickup management routes
router.get('/', authMiddleware, getPickups);
router.delete('/:pickupId', authMiddleware, deletePickup);

export default router; 