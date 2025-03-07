import jwt from 'jsonwebtoken';
import { secretKey } from '../config/jwtConfig.js';
import User from '../models/user.js';

export const verifyResubmissionToken = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, secretKey);
        
        if (!decoded || !decoded.username || !decoded.email) {
            return res.status(400).json({ error: 'Invalid token' });
        }

        const user = await User.findOne({ username: decoded.username, email: decoded.email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ 
            email: user.email,
            user: {
                username: user.username,
                email: user.email,
                verificationComments: user.verificationComments
            }
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};
