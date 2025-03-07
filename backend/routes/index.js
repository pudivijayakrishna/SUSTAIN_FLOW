import express from 'express';
import authRoutes from './auth.js';
import adminRoutes from './admin.js';
import ngoRoutes from './ngo.js';
import agencyRoutes from './agency.js';
import donorRoutes from './donor.js';
import pickupRoutes from './pickup.js';
import feedbackRoutes from './feedback.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/ngo', ngoRoutes);
router.use('/agency', agencyRoutes);
router.use('/donor', donorRoutes);
router.use('/pickup', pickupRoutes);
router.use('/feedback', feedbackRoutes);

export default router;
