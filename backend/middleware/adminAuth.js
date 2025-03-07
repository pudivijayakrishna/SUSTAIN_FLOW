import jwt from 'jsonwebtoken';
import { secretKey } from '../config/jwtConfig.js';

export const adminAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Invalid token format' });
        }

        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid token' });
            }

            // Check if user is admin
            if (!decoded.isAdmin || decoded.role !== 'admin') {
                return res.status(403).json({ 
                    error: 'Admin access required',
                    message: 'You do not have admin privileges'
                });
            }

            // Add admin info to request
            req.admin = {
                ...decoded,
                isAdmin: true
            };

            next();
        });
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        return res.status(500).json({ 
            error: 'Authentication error',
            message: 'Failed to verify admin credentials'
        });
    }
};

// Optional: Specific admin role checks
export const requireAdminRole = (allowedRoles = ['superadmin', 'admin']) => {
    return (req, res, next) => {
        try {
            if (!req.admin) {
                return res.status(401).json({ 
                    error: 'Admin authentication required'
                });
            }

            if (!allowedRoles.includes(req.admin.role)) {
                return res.status(403).json({ 
                    error: 'Insufficient privileges',
                    message: `Required role: ${allowedRoles.join(' or ')}`
                });
            }

            next();
        } catch (error) {
            console.error('Admin role check error:', error);
            return res.status(500).json({ 
                error: 'Authorization error',
                message: 'Failed to verify admin role'
            });
        }
    };
}; 