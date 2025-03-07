import Transaction from '../models/transaction.js';

export const validatePoints = async (req, res, next) => {
    try {
        const { additionalPoints, pickupId } = req.body;

        // Basic validation
        if (additionalPoints < 0) {
            return res.status(400).json({
                error: 'Points cannot be negative'
            });
        }

        // If pickup ID is provided, validate against transaction quantity
        if (pickupId) {
            const pickup = await Pickup.findById(pickupId)
                .populate('transaction');

            if (!pickup) {
                return res.status(404).json({
                    error: 'Pickup not found'
                });
            }

            // Base points calculation (quantity × 10)
            const basePoints = pickup.transaction.quantity * 10;
            
            // Additional points shouldn't exceed 50% of base points
            const maxAdditionalPoints = basePoints * 0.5;

            if (additionalPoints > maxAdditionalPoints) {
                return res.status(400).json({
                    error: `Additional points cannot exceed ${maxAdditionalPoints} for this pickup`
                });
            }
        }

        next();
    } catch (error) {
        console.error('Points validation error:', error);
        res.status(500).json({ error: 'Server error' });
    }
}; 