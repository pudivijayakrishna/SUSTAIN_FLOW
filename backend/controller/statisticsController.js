import Transaction from '../models/transaction.js';
import History from '../models/history.js';
import UserPoints from '../models/userPoints.js';

export const getWasteStatistics = async (req, res) => {
    try {
        // Get waste collection stats
        const wasteStats = await Transaction.aggregate([
            {
                $match: {
                    type: 'compostAgency',
                    status: 'accepted'
                }
            },
            {
                $group: {
                    _id: '$wasteType',
                    totalQuantity: { $sum: '$quantity' },
                    weeklyData: {
                        $push: {
                            quantity: '$quantity',
                            createdAt: '$createdAt'
                        }
                    }
                }
            }
        ]);

        // Process weekly data
        const processedStats = wasteStats.map(stat => ({
            wasteType: stat._id,
            totalQuantity: stat.totalQuantity,
            weeklyBreakdown: processWeeklyData(stat.weeklyData)
        }));

        res.status(200).json({
            success: true,
            data: processedStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching waste statistics'
        });
    }
};

export const getDonationStatistics = async (req, res) => {
    try {
        // Get donation category stats
        const donationStats = await Transaction.aggregate([
            {
                $match: {
                    type: 'ngo',
                    status: 'accepted'
                }
            },
            {
                $group: {
                    _id: {
                        category: '$itemCategory',
                        location: '$location'
                    },
                    totalQuantity: { $sum: '$quantity' },
                    weeklyData: {
                        $push: {
                            quantity: '$quantity',
                            createdAt: '$createdAt'
                        }
                    }
                }
            }
        ]);

        // Process stats with location breakdown
        const processedStats = donationStats.map(stat => ({
            category: stat._id.category,
            location: stat._id.location,
            totalQuantity: stat.totalQuantity,
            weeklyBreakdown: processWeeklyData(stat.weeklyData)
        }));

        res.status(200).json({
            success: true,
            data: processedStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching donation statistics'
        });
    }
};

export const getTransactionSummary = async (req, res) => {
    try {
        const { startDate, endDate, role } = req.query;

        let query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (role) {
            query.type = role;
        }

        const transactions = await Transaction.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: 'users',
                    localField: 'sender',
                    foreignField: 'username',
                    as: 'senderDetails'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'receiver',
                    foreignField: 'username',
                    as: 'receiverDetails'
                }
            },
            {
                $project: {
                    sender: 1,
                    receiver: 1,
                    type: 1,
                    quantity: 1,
                    points: 1,
                    status: 1,
                    createdAt: 1,
                    senderRole: { $arrayElemAt: ['$senderDetails.role', 0] },
                    receiverRole: { $arrayElemAt: ['$receiverDetails.role', 0] }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: transactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error fetching transaction summary'
        });
    }
};

// Helper function to process weekly data
const processWeeklyData = (data) => {
    const weeks = {};
    
    data.forEach(item => {
        const date = new Date(item.createdAt);
        date.setHours(date.getHours() + 5); // Convert to IST
        date.setMinutes(date.getMinutes() + 30);
        
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeks[weekKey]) {
            weeks[weekKey] = 0;
        }
        weeks[weekKey] += item.quantity;
    });

    return Object.entries(weeks).map(([week, quantity]) => ({
        week,
        quantity
    }));
}; 