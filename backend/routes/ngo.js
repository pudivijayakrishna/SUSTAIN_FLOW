import express from 'express';
import * as ngoController from '../controller/ngo.js';
import { addNotificationRoutes } from '../middleware/notificationRoutes.js';
import { pickupManagerAuthMiddleware, ngoAuthMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Pickup management routes (accessible to both NGO and Agency)
const pickupRoutes = express.Router();
pickupRoutes.use(pickupManagerAuthMiddleware);

// Pickup routes
pickupRoutes.get('/pickups', ngoController.getPickups);
pickupRoutes.get('/pickup/:pickupId', ngoController.getPickupDetails);
pickupRoutes.post('/pickup/:pickupId/complete', ngoController.completePickup);
pickupRoutes.post('/pickup/:pickupId/cancel', ngoController.cancelPickup);
pickupRoutes.post('/pickup/:pickupId/propose-dates', ngoController.proposeDates);
pickupRoutes.post('/pickup/:pickupId/request-qr', ngoController.requestQrCode);
pickupRoutes.put('/pickup/:pickupId/status', ngoController.updatePickupStatus);

// NGO-specific routes
router.use(ngoAuthMiddleware);

// Get pending requests
router.get('/requests', ngoController.requests);

// Accept request
router.post('/accept-request', ngoController.accept_request);

// Reject request
router.post('/reject-request', ngoController.reject_request);

// Get NGO rewards
router.get('/rewards', ngoController.rewards);

// Add reward
router.post('/add-reward', ngoController.add_reward);

// Delete reward
router.post('/delete-reward', ngoController.delete_reward);

// Get NGO history
router.get('/history', ngoController.history);

// Add notification routes
addNotificationRoutes(router, 'ngo');

// Mount pickup routes
router.use('/', pickupRoutes);

export default router;