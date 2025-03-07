import express from 'express';
import cors from 'cors';
import * as controller from '../controller/agency.js';
import { pickupManagerAuthMiddleware, agencyAuthMiddleware } from '../middleware/auth.js';
import dotenv from 'dotenv'
import Notification from '../models/notification.js'
import { addNotificationRoutes } from '../middleware/notificationRoutes.js';

const router = express.Router();
dotenv.config();

const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    allowedHeaders: ['Authorization', 'Content-Type', 'Role'],
};
  
router.use(cors(corsOptions));

// Pickup management routes (accessible to both NGO and Agency)
const pickupRoutes = express.Router();
pickupRoutes.use(pickupManagerAuthMiddleware);

// Pickup routes
pickupRoutes.get('/pickups', controller.getAgencyPickups);
pickupRoutes.get('/pickup/:pickupId', controller.getPickupDetails);
pickupRoutes.post('/pickup/:pickupId/complete', controller.completePickup);
pickupRoutes.post('/pickup/:pickupId/propose-dates', controller.proposeDates);
pickupRoutes.post('/pickup/:pickupId/request-qr', controller.requestQrCode);
pickupRoutes.put('/pickup/:pickupId/status', controller.updatePickupStatus);

// Agency-specific routes
router.use(agencyAuthMiddleware);

router.get('/', controller.queue);
router.post('/confirm-supplies', controller.cofirm_supplies);
router.post('/reject-supplies', controller.reject_supplies);
router.get('/history', controller.history);
router.post('/add-reward', controller.add_reward);
router.post('/delete-reward', controller.delete_reward);
router.get('/rewards', controller.rewards);
router.get('/transactions/history', controller.transactions_history);

// Add notification routes
addNotificationRoutes(router, 'compostAgency');

// Mount pickup routes
router.use('/', pickupRoutes);

export default router;