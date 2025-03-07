import User from '../models/user.js';
import bcrypt from 'bcrypt';

export const passwordHistoryCheck = async (req, res, next) => {
    try {
        const { password, newPassword } = req.body;
        const passwordToCheck = newPassword || password;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check last 3 passwords
        for (const historyEntry of user.passwordHistory.slice(-3)) {
            const isMatch = await bcrypt.compare(passwordToCheck, historyEntry.password);
            if (isMatch) {
                return res.status(400).json({ 
                    error: 'Cannot reuse any of your last 3 passwords' 
                });
            }
        }

        next();
    } catch (error) {
        console.error('Password history check error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}; 