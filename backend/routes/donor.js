import express from 'express';
import cors from 'cors';
import * as controller from '../controller/donor.js';
import { authenticateDonorToken } from '../config/authMiddleware.js';
import dotenv from 'dotenv';
import { addNotificationRoutes } from '../middleware/notificationRoutes.js';

const router = express.Router();
dotenv.config();

const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    allowedHeaders: ['Authorization', 'Content-Type', 'Role'],
};

router.use(cors(corsOptions));

// Apply authentication middleware to all routes
router.use(authenticateDonorToken);

router.get('/nearby-agency/:role', controller.nearby_agency);
router.get('/reward-store', controller.reward_store);
router.post('/redeem-reward', controller.reedem_reward);
router.post('/pickup/:pickupId/confirm-date', controller.confirmPickupDate);
router.post('/pickup/:pickupId/accept-qr', controller.acceptQrRequest);
router.get('/pickup/:pickupId/generate-qr', controller.generateQrCode);
router.post('/donate-supplies', async (req, res) => {
    try {
        console.log('Received donation request:', req.body);
        
        // Validate required fields
        const requiredFields = ['username', 'type', 'quantity', 'description'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                error: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        // Additional validation based on type
        if (req.body.type === 'ngo') {
            if (!req.body.itemCategory) {
                return res.status(400).json({ error: 'Item category is required for NGO donations' });
            }
            if (req.body.itemCategory === 'others' && !req.body.itemName) {
                return res.status(400).json({ error: 'Item name is required for "others" category' });
            }
        } else if (req.body.type === 'compostAgency') {
            if (!req.body.wasteType || !req.body.itemType) {
                return res.status(500).json({ 
                    error: 'Waste type and item type are required for compost agency donations' 
                });
            }
        }

        await controller.donate_supplies(req, res);
    } catch (error) {
        console.error('Error in donate-supplies route:', error);
        res.status(500).json({ 
            error: 'Server Error',
            details: error.message 
        });
    }
});
router.get('/total-points', controller.getTotalPoints);
router.get('/history', controller.getDonorHistory);
router.get('/donation-requests', controller.getDonationRequests);

// Add this temporary test route
router.get('/test', (req, res) => {
    res.json({ message: 'Donor routes are working' });
});

// Add notification routes with authentication
addNotificationRoutes(router);

// Add this new route
router.get('/profile', authenticateDonorToken, controller.getProfile);

// Pickup routes
router.get('/pickups', authenticateDonorToken, controller.getDonorPickups);
router.get('/pickup/:pickupId', authenticateDonorToken, controller.getDonorPickupDetails);

// QR code routes
router.post('/pickup/:pickupId/accept-qr', controller.acceptQrRequest);
router.get('/pickup/:pickupId/generate-qr', controller.generateQrCode);

export default router;
