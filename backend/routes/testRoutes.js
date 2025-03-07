import express from 'express';
import { 
    sendDonationRequestEmail,
    sendDonationAcceptanceEmail,
    sendDonationRejectionEmail,
    sendDateProposalEmail,
    sendQRCodeRequestEmail,
    sendQRCodeGenerationEmail,
    sendPointsEarnedEmail,
    sendRewardRedemptionConfirmation,
    sendRewardRedemptionRequest,
    sendWelcomeEmail
} from '../services/emailService.js';

const router = express.Router();

// Test donation request email
router.post('/test-donation-request', async (req, res) => {
    try {
        const testUser = {
            name: 'Test User',
            email: req.body.email || 'test@example.com'
        };

        const testDonation = {
            wasteType: 'Organic',
            itemType: 'Food Waste',
            quantity: 5,
            donorName: 'Test Donor'
        };

        await sendDonationRequestEmail(testUser, testDonation);
        res.json({ message: 'Test donation request email sent successfully' });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test donation acceptance email
router.post('/test-donation-acceptance', async (req, res) => {
    try {
        const testUser = {
            name: 'Test User',
            email: req.body.email || 'test@example.com'
        };

        const testDonation = {
            wasteType: 'Organic',
            itemType: 'Food Waste',
            agencyName: 'Test Agency'
        };

        await sendDonationAcceptanceEmail(testUser, testDonation);
        res.json({ message: 'Test donation acceptance email sent successfully' });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test pickup date proposal email
router.post('/test-date-proposal', async (req, res) => {
    try {
        const testUser = {
            name: 'Test User',
            email: req.body.email || 'test@example.com'
        };

        const testDates = [
            { date: '2024-12-26', timeSlot: 'morning' },
            { date: '2024-12-27', timeSlot: 'afternoon' }
        ];

        const testPickup = {
            pickupId: '12345',
            wasteType: 'Organic',
            quantity: 5
        };

        await sendDateProposalEmail(testUser, testDates, testPickup);
        res.json({ message: 'Test date proposal email sent successfully' });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test QR code request email
router.post('/test-qr-request', async (req, res) => {
    try {
        const testUser = {
            name: 'Test User',
            email: req.body.email || 'test@example.com'
        };

        const testPickup = {
            pickupId: '12345',
            date: '2024-12-26',
            wasteType: 'Organic',
            quantity: 5
        };

        await sendQRCodeRequestEmail(testUser, testPickup);
        res.json({ message: 'Test QR code request email sent successfully' });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test points earned email
router.post('/test-points-earned', async (req, res) => {
    try {
        const testUser = {
            name: 'Test User',
            email: req.body.email || 'test@example.com'
        };

        const testAgency = {
            name: 'Test Agency'
        };

        await sendPointsEarnedEmail(testUser, 100, testAgency);
        res.json({ message: 'Test points earned email sent successfully' });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test welcome email directly
router.post('/test-welcome-email', async (req, res) => {
    try {
        console.log('Test welcome email route hit');
        const testUser = {
            name: 'Test User',
            email: req.body.email || 'test@example.com',
            username: 'testuser',
            role: 'donor'
        };

        console.log('Attempting to send test welcome email to:', testUser.email);
        await sendWelcomeEmail(testUser);
        console.log('Test welcome email sent successfully');
        
        res.json({ message: 'Test welcome email sent successfully' });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
