import jwt from 'jsonwebtoken';
import { secretKey } from "./jwtConfig.js";

export const generateToken = (user) => {
    const payload = {
        id: user._id,
        username: user.username,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt
    }
    return jwt.sign(payload, secretKey, { expiresIn: '24h' });
}
