import jwt from 'jsonwebtoken';
import { secretKey } from '../config/jwtConfig.js';

// Basic token verification
export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, secretKey);
        
        // Set complete user object in req.user
        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role,
            name: decoded.name
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// Admin authorization middleware
export const adminAuthMiddleware = (req, res, next) => {
    try {
        // First verify the token
        authMiddleware(req, res, () => {
            // Then check if user is admin
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }
            next();
        });
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Role-specific middleware
const createRoleMiddleware = (role) => (req, res, next) => {
    try {
        // First verify the token
        authMiddleware(req, res, () => {
            // Then check if user has the required role
            if (req.user.role !== role) {
                return res.status(403).json({ error: `${role} access required` });
            }
            next();
        });
    } catch (error) {
        console.error(`${role} auth middleware error:`, error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Export role-specific middleware
export const donorAuthMiddleware = createRoleMiddleware('donor');
export const ngoAuthMiddleware = createRoleMiddleware('ngo');
export const agencyAuthMiddleware = createRoleMiddleware('compostAgency');

// Combined middleware for NGO and Agency
export const pickupManagerAuthMiddleware = (req, res, next) => {
    try {
        // First verify the token
        authMiddleware(req, res, () => {
            // Then check if user is NGO or Agency
            if (req.user.role !== 'ngo' && req.user.role !== 'compostAgency') {
                return res.status(403).json({ error: 'NGO or Agency access required' });
            }
            next();
        });
    } catch (error) {
        console.error('Pickup manager auth middleware error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Backward compatibility exports
export const auth = authMiddleware;
export const adminAuth = adminAuthMiddleware;
export const authenticateToken = authMiddleware;
export const authenticateDonorToken = donorAuthMiddleware;
export const authenticateNgoToken = ngoAuthMiddleware;
export const authenticateAgencyToken = agencyAuthMiddleware;