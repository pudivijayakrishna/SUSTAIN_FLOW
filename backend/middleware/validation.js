// Validation middleware for pickup requests
export const validatePickupRequest = (req, res, next) => {
    try {
        const { dates } = req.body;

        // Validate dates array
        if (!dates || !Array.isArray(dates) || dates.length === 0 || dates.length > 3) {
            return res.status(400).json({
                error: 'Please provide 1-3 pickup dates'
            });
        }

        // Validate each date
        const validTimeSlots = [
            '10:00 AM', '11:00 AM', '12:00 PM',
            '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
        ];

        const isValid = dates.every(date => {
            if (!date.date || !date.timeSlot) return false;
            if (!validTimeSlots.includes(date.timeSlot)) return false;
            
            const pickupDate = new Date(date.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            return pickupDate > today;
        });

        if (!isValid) {
            return res.status(400).json({
                error: 'Invalid date or time slot'
            });
        }

        next();
    } catch (error) {
        console.error('Validation error:', error);
        return res.status(500).json({
            error: 'Validation failed',
            details: error.message
        });
    }
};

// Validation middleware for pickup completion
export const validatePickupCompletion = (req, res, next) => {
    try {
        const { pickupId, qrData, additionalPoints } = req.body;

        // Check required fields
        if (!pickupId || !qrData) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        // Validate additional points if provided
        if (additionalPoints !== undefined) {
            if (isNaN(additionalPoints) || additionalPoints < 0) {
                return res.status(400).json({
                    error: 'Invalid additional points'
                });
            }
        }

        next();
    } catch (error) {
        console.error('Validation error:', error);
        return res.status(500).json({
            error: 'Validation failed',
            details: error.message
        });
    }
};

// Validation middleware for pickup date confirmation
export const validatePickupDateConfirmation = (req, res, next) => {
    try {
        const { pickupId, dateId } = req.body;

        if (!pickupId || !dateId) {
            return res.status(400).json({
                error: 'Pickup ID and Date ID are required'
            });
        }

        next();
    } catch (error) {
        console.error('Validation error:', error);
        return res.status(500).json({
            error: 'Validation failed',
            details: error.message
        });
    }
};

// Validation middleware for feedback
export const validateFeedback = (req, res, next) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                error: 'Rating must be between 1 and 5'
            });
        }

        if (comment && comment.length > 500) {
            return res.status(400).json({
                error: 'Comment must not exceed 500 characters'
            });
        }

        next();
    } catch (error) {
        console.error('Validation error:', error);
        return res.status(500).json({
            error: 'Validation failed',
            details: error.message
        });
    }
}; 