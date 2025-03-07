import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

export const secretKey = process.env.JWT_SECRET;

if (!secretKey) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

export const jwtConfig = {
    expiresIn: '24h',
    algorithm: 'HS256'
};

export const generateAdminToken = (adminData) => {
    return jwt.sign(
        {
            username: adminData.username,
            role: 'admin',
            isAdmin: true
        },
        secretKey,
        jwtConfig
    );
};

export const verifyToken = (token) => {
    try {
        // Remove quotes if present
        const cleanToken = token.replace(/^"|"$/g, '');
        return jwt.verify(cleanToken, secretKey);
    } catch (error) {
        throw new Error('Invalid token');
    }
};