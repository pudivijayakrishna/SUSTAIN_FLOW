export const passwordChangeRequired = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If password change is required, only allow access to change-password route
        if (user.mustChangePassword && req.path !== '/change-password') {
            return res.status(403).json({ 
                error: 'Password change required',
                mustChangePassword: true
            });
        }

        next();
    } catch (error) {
        console.error('Password change check error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}; 