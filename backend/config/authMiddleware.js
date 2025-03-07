import jwt from 'jsonwebtoken';
import { secretKey } from './jwtConfig.js';

export const authenticateToken = (req, res, next) => {
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
            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Authentication error' });
    }
};

// Authentication middleware for notifications
export const authenticateNotificationToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Missing Token!" });
    }

    const [bearer, token] = authHeader.split(" ");
    const cleanToken = token.replace(/"/g, '');

    if (bearer !== "Bearer" || !cleanToken) {
        return res.status(401).json({ message: "Invalid token format!" });
    }

    try {
        const decoded = jwt.verify(cleanToken, secretKey);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid token!" });
    }
};

// Authentication middleware for Donor role
export const authenticateDonorToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid token' });
            }

            // Attach all necessary user information
            req.user = {
                id: decoded.id,
                username: decoded.username,
                role: decoded.role
            };
            
            next();
        });
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Authentication error' });
    }
};

// Authentication middleware for NGO role
export const authenticateNgoToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return res.status(401).json({ message: "Missing Token!" });
    }
    let [bearer, token] = authHeader.split(" ");
    token = token.replace(/"/g, '');

    if (bearer !== "Bearer" || !token) {
        return res.status(401).json({ message: "Invalid token format!" });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err || user.role !== 'ngo') {
            return res.status(403).json({ message: "Access Forbidden! Invalid token or role." });
        }
        req.user = user;
        next();
    });
};

// Authentication middleware for Compost Agency role
export const authenticateAgencyToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return res.status(401).json({ message: "Missing Token!" });
    }
    let [bearer, token] = authHeader.split(" ");
    token = token.replace(/"/g, '');

    if (bearer !== "Bearer" || !token) {
        return res.status(401).json({ message: "Invalid token format!" });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err || user.role !== 'compostAgency') {
            return res.status(403).json({ message: "Access Forbidden! Invalid token or role." });
        }
        req.user = user;
        next();
    });
};

export const authenticateAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, secretKey);
        
        if (!decoded.isAdmin) {
            return res.status(403).json({ error: 'Not authorized as admin' });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        console.error('Admin authentication error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};
