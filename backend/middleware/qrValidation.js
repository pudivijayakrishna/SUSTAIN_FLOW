import { isQRCodeExpired } from '../services/qrService.js';
import Pickup from '../models/pickup.js';

export const validateQRRequest = async (req, res, next) => {
    try {
        console.log('QR Request - Headers:', req.headers);
        console.log('QR Request - User:', req.user);
        console.log('QR Request - Params:', req.params);

        const pickup = await Pickup.findById(req.params.pickupId);
        
        if (!pickup) {
            console.log('Pickup not found:', req.params.pickupId);
            return res.status(404).json({ error: 'Pickup not found' });
        }

        console.log('Pickup found:', {
            id: pickup._id,
            status: pickup.status,
            receiver: pickup.receiver,
            donor: pickup.donor
        });

        // Check if pickup is in scheduled status
        if (pickup.status !== 'scheduled') {
            console.log('Invalid pickup status:', pickup.status);
            return res.status(400).json({ 
                error: 'QR code can only be requested for scheduled pickups' 
            });
        }

        // Check if the user is the receiver
        if (pickup.receiver !== req.user.username) {
            console.log('Unauthorized user:', {
                requestUser: req.user.username,
                pickupReceiver: pickup.receiver
            });
            return res.status(403).json({ 
                error: 'Only the assigned agency/NGO can request QR codes' 
            });
        }

        // Check if there's already an active QR code
        const activeQR = pickup.qrCodes?.find(qr => 
            qr.status === 'active' && !isQRCodeExpired(qr)
        );

        if (activeQR) {
            console.log('Active QR code found:', activeQR);
            return res.status(400).json({ 
                error: 'An active QR code already exists' 
            });
        }

        console.log('QR request validation successful');
        req.pickup = pickup;
        next();
    } catch (error) {
        console.error('QR validation error:', error);
        res.status(500).json({ 
            error: 'Server error',
            details: error.message 
        });
    }
};

export const validateQRCompletion = async (req, res, next) => {
    try {
        const { pickupId, qrData } = req.body;
        
        if (!pickupId || !qrData) {
            return res.status(400).json({ 
                error: 'Pickup ID and QR data are required' 
            });
        }

        const pickup = await Pickup.findById(pickupId);
        
        if (!pickup) {
            return res.status(404).json({ error: 'Pickup not found' });
        }

        // Check if pickup is in scheduled status
        if (pickup.status !== 'scheduled') {
            return res.status(400).json({ 
                error: 'Only scheduled pickups can be completed' 
            });
        }

        // Check if the user is the receiver
        if (pickup.receiver !== req.user.username) {
            return res.status(403).json({ 
                error: 'Only the assigned agency can complete the pickup' 
            });
        }

        req.pickup = pickup;
        next();
    } catch (error) {
        console.error('QR completion validation error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}; 