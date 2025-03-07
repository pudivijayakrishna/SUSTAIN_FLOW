import { baseEmailTemplate } from './baseTemplate.js';

// Reward Redemption Request (to Donor)
export const getRewardRedemptionConfirmation = (donor, reward, agency) => {
    const content = `
        <div>
            <h2 style="color: #2e7d32; margin-bottom: 20px;">Reward Redemption Confirmation</h2>
            
            <p style="color: #333; line-height: 1.6;">
                Dear ${donor.name}, your reward redemption request has been submitted successfully!
            </p>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">Reward Details</h3>
                <ul style="color: #333; line-height: 1.6;">
                    <li><strong>Reward Name:</strong> ${reward.name}</li>
                    <li><strong>Points Used:</strong> ${reward.point}</li>
                    <li><strong>Provider:</strong> ${agency.name}</li>
                </ul>
            </div>

            <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #e65100; margin: 0;">
                    <strong>Note:</strong> The organization will review your request and contact you with further instructions.
                </p>
            </div>
        </div>
    `;

    return baseEmailTemplate(content, {
        title: 'Reward Redemption Confirmation',
        showPointsInfo: true,
        showPointsBalance: true,
        pointsBalance: donor.currentPoints - reward.point
    });
};

// Reward Redemption Request (to Agency)
export const getRewardRedemptionRequest = (donor, reward, agency) => {
    const content = `
        <div>
            <h2 style="color: #2e7d32; margin-bottom: 20px;">New Reward Redemption Request</h2>
            
            <p style="color: #333; line-height: 1.6;">
                Dear ${agency.name}, a new reward redemption request has been received.
            </p>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">Request Details</h3>
                <ul style="color: #333; line-height: 1.6;">
                    <li><strong>Donor Name:</strong> ${donor.name}</li>
                    <li><strong>Contact:</strong> ${donor.contact}</li>
                    <li><strong>Reward Name:</strong> ${reward.name}</li>
                    <li><strong>Points:</strong> ${reward.point}</li>
                </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/dashboard/rewards" 
                   style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    Process Request
                </a>
            </div>
        </div>
    `;

    return baseEmailTemplate(content, {
        title: 'New Reward Redemption Request',
        showFeedback: false
    });
};

// Reward Redemption Approval (to Donor)
export const getRewardApprovalEmail = (donor, reward, agency) => {
    const content = `
        <div>
            <h2 style="color: #2e7d32; margin-bottom: 20px;">Reward Redemption Approved!</h2>
            
            <p style="color: #333; line-height: 1.6;">
                Dear ${donor.name}, your reward redemption request has been approved!
            </p>

            <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">Reward Details</h3>
                <ul style="color: #333; line-height: 1.6;">
                    <li><strong>Reward:</strong> ${reward.name}</li>
                    <li><strong>Points Used:</strong> ${reward.point}</li>
                    <li><strong>Provider:</strong> ${agency.name}</li>
                </ul>
            </div>

            <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="color: #e65100; margin-top: 0;">Next Steps</h4>
                <p style="color: #333; margin-bottom: 0;">
                    ${agency.name} will contact you shortly with instructions on how to claim your reward.
                    Please keep this email for reference.
                </p>
            </div>
        </div>
    `;

    return baseEmailTemplate(content, {
        title: 'Reward Redemption Approved',
        showPointsInfo: true,
        showPointsBalance: true,
        pointsBalance: donor.currentPoints,
        showFeedback: true,
        feedbackToken: reward._id
    });
};

// Reward Redemption Rejection (to Donor)
export const getRewardRejectionEmail = (donor, reward, agency, reason) => {
    const content = `
        <div>
            <h2 style="color: #d32f2f; margin-bottom: 20px;">Reward Redemption Update</h2>
            
            <p style="color: #333; line-height: 1.6;">
                Dear ${donor.name}, we regret to inform you that your reward redemption request could not be processed.
            </p>

            <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #d32f2f; margin-top: 0;">Request Details</h3>
                <ul style="color: #333; line-height: 1.6;">
                    <li><strong>Reward:</strong> ${reward.name}</li>
                    <li><strong>Points:</strong> ${reward.point}</li>
                    <li><strong>Provider:</strong> ${agency.name}</li>
                    ${reason ? `<li><strong>Reason:</strong> ${reason}</li>` : ''}
                </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/rewards" 
                   style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    Browse Other Rewards
                </a>
            </div>
        </div>
    `;

    return baseEmailTemplate(content, {
        title: 'Reward Redemption Update',
        showPointsInfo: true,
        showPointsBalance: true,
        pointsBalance: donor.currentPoints,
        showFeedback: true,
        feedbackToken: reward._id
    });
}; 