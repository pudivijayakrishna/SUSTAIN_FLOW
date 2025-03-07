import express from 'express';
import { adminAuthMiddleware } from '../middleware/auth.js';
import User from '../models/user.js';
import {
    adminLogin,
    getPickups,
    getFeedback,
    deletePickup,
    updatePickup,
    getQRHistory,
    getDashboardStats,
    getTransactionDetails,
    getWasteDetails,
    getDonationDetails,
    verifyDocument,
    decryptDocument,
    replyToFeedback,
    deleteFeedback,
    getUsers,
    updateUser,
    deleteUser,
    getPendingVerifications,
    getRejectedVerifications,
    getVerificationStats,
    getUserDetails
} from '../controller/adminController.js';

const router = express.Router();

// Admin login
router.post('/login', adminLogin);

// Protected admin routes
router.get('/pickups', adminAuthMiddleware, getPickups);
router.get('/feedback', adminAuthMiddleware, getFeedback);
router.delete('/pickups/:id', adminAuthMiddleware, deletePickup);
router.put('/pickups/:id', adminAuthMiddleware, updatePickup);
router.get('/qr-history', adminAuthMiddleware, getQRHistory);
router.get('/dashboard/stats', adminAuthMiddleware, getDashboardStats);
router.get('/transaction-details', adminAuthMiddleware, getTransactionDetails);
router.get('/waste-details', adminAuthMiddleware, getWasteDetails);
router.get('/donation-details', adminAuthMiddleware, getDonationDetails);

// Document verification routes
router.get('/verifications/pending', adminAuthMiddleware, getPendingVerifications);
router.get('/verifications/rejected', adminAuthMiddleware, getRejectedVerifications);
router.get('/verifications/stats', adminAuthMiddleware, getVerificationStats);
router.post('/verify-document', adminAuthMiddleware, verifyDocument);
router.post('/decrypt-document', adminAuthMiddleware, decryptDocument);

// User management routes
router.get('/users', adminAuthMiddleware, getUsers);
router.get('/users/:id', adminAuthMiddleware, getUserDetails);
router.put('/users/:id', adminAuthMiddleware, updateUser);
router.delete('/users/:id', adminAuthMiddleware, deleteUser);

export default router;