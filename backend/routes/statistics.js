import express from 'express';
import { verifyAdminToken } from '../controller/adminController.js';
import {
    getWasteStatistics,
    getDonationStatistics,
    getTransactionSummary
} from '../controller/statisticsController.js';

const router = express.Router();

// Protected routes - need admin token
router.use(verifyAdminToken);

router.get('/waste', getWasteStatistics);
router.get('/donations', getDonationStatistics);
router.get('/transactions', getTransactionSummary);

export default router; 