import User from '../models/user.js';

// Get user profile
export const getProfile = async (req, res) => {
    try {
        console.log("Getting profile for user ID:", req.user.id);
        
        const user = await User.findById(req.user.id)
            .select('name username email role contact address location');
            
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Convert to plain object and format location
        const userResponse = user.toObject();
        
        // Format location for frontend consistency
        if (userResponse.location) {
            if (userResponse.location.coordinates && userResponse.location.address) {
                userResponse.location = {
                    label: userResponse.location.address,
                    position: {
                        lat: userResponse.location.coordinates.lat,
                        lon: userResponse.location.coordinates.lon
                    }
                };
            } else if (typeof userResponse.location === 'string' && userResponse.location.includes(',')) {
                const [lat, lon] = userResponse.location.split(',').map(Number);
                userResponse.location = {
                    label: `${lat},${lon}`,
                    position: { lat, lon }
                };
            }
        }

        console.log("Sending user data:", userResponse);

        res.json({
            success: true,
            user: userResponse
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update user profile
export const updateProfile = async (req, res) => {
    try {
        const { name, contact, address, location } = req.body;

        // Find user and update
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update basic fields
        if (name) user.name = name;
        if (contact) user.contact = contact;
        if (address) user.address = address;
        
        // Handle location update
        if (location) {
            if (location.position && location.label) {
                user.location = {
                    coordinates: {
                        lat: location.position.lat,
                        lon: location.position.lon
                    },
                    address: location.label
                };
            } else if (typeof location === 'string' && location.includes(',')) {
                // Handle legacy format
                const [lat, lon] = location.split(',').map(Number);
                user.location = {
                    coordinates: { lat, lon },
                    address: `${lat},${lon}`
                };
            }
        }

        await user.save();

        // Format response
        const userResponse = user.toObject();
        
        // Format location for frontend
        if (userResponse.location) {
            if (userResponse.location.coordinates && userResponse.location.address) {
                userResponse.location = {
                    label: userResponse.location.address,
                    position: {
                        lat: userResponse.location.coordinates.lat,
                        lon: userResponse.location.coordinates.lon
                    }
                };
            }
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            error: 'Failed to update profile',
            details: error.message 
        });
    }
};