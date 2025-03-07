import { baseEmailTemplate } from './baseTemplate.js';

// Pickup Proposal Email (Legacy)
const getPickupProposalEmailLegacy = (user, dates, pickupDetails) => {
    return baseEmailTemplate(`
        <h2 style="color: #2196f3; text-align: center;">Pickup Schedule Proposal</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Dear ${user.name},</p>
            <p>We have proposed the following dates for your donation pickup:</p>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                ${dates.map((date, index) => `
                    <div style="margin: 10px 0;">
                        <strong>Option ${index + 1}:</strong> ${new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                `).join('')}
            </div>

            <p>Please log in to your account to confirm your preferred date.</p>
        </div>
    `);
};

// Pickup Proposal Email (New)
 const getPickupProposalEmail = (donor, data) => {
    const content = `
        <div>
            <h2 style="color: #2e7d32;">Pickup Schedule Proposal</h2>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">Donation Details</h3>
                <ul style="color: #333; line-height: 1.6;">
                    <li><strong>Quantity:</strong> ${data.quantity} kg</li>
                    <li><strong>Agency:</strong> ${data.receiverName}</li>
                </ul>
            </div>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">Proposed Dates</h3>
                <ul style="color: #333; line-height: 1.6;">
                    ${data.proposedDates.map(date => `
                        <li>
                            <strong>Date:</strong> ${new Date(date.date).toLocaleDateString()}
                            <strong>Time:</strong> ${date.timeSlot}
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/donor/pickups/${data._id}" 
                   style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    View and Respond
                </a>
            </div>
        </div>
    `;

    return baseEmailTemplate(content);
};

// Pickup Confirmation Email (Legacy)
const getPickupConfirmationEmailLegacy = (user, pickupDetails) => {
    return baseEmailTemplate(`
        <h2 style="color: #2e7d32; text-align: center;">Pickup Date Confirmed</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Dear ${user.name},</p>
            <p>Your pickup has been confirmed for:</p>
            
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Date:</strong> ${new Date(pickupDetails.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}</p>
                <p><strong>Time:</strong> ${pickupDetails.time}</p>
                <p><strong>Location:</strong> ${pickupDetails.location}</p>
            </div>

            <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Next Steps:</strong></p>
                <ol style="margin: 10px 0;">
                    <li>Prepare your items for pickup</li>
                    <li>Request a QR code for verification</li>
                    <li>Have the QR code ready for scanning during pickup</li>
                </ol>
            </div>
        </div>
    `);
};

// Pickup Confirmation Email (New)
const getPickupConfirmationEmail = (agency, data) => {
    const content = `
        <div>
            <h2 style="color: #2e7d32;">Pickup Date Confirmed</h2>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">Pickup Details</h3>
                <ul style="color: #333; line-height: 1.6;">
                    <li><strong>Donor:</strong> ${data.donor}</li>
                    <li><strong>Quantity:</strong> ${data.quantity} kg</li>
                    <li><strong>Confirmed Date:</strong> ${new Date(data.confirmedDate.date).toLocaleDateString()}</li>
                    <li><strong>Time Slot:</strong> ${data.confirmedDate.timeSlot}</li>
                </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/agency/pickups" 
                   style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    View Pickup Details
                </a>
            </div>
        </div>
    `;

    return baseEmailTemplate(content);
};

// QR Request Email (Legacy)
const getQRRequestEmailLegacy = (user, pickupDetails) => {
    return baseEmailTemplate(`
        <h2 style="color: #2196f3; text-align: center;">QR Code Request Received</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Dear ${user.name},</p>
            <p>We have received your request for a QR code for your upcoming pickup.</p>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Pickup ID:</strong> ${pickupDetails.pickupId}</p>
                <p><strong>Date:</strong> ${new Date(pickupDetails.date).toLocaleDateString()}</p>
                <p><strong>Status:</strong> Processing</p>
            </div>

            <p>We will generate and send your QR code shortly.</p>
        </div>
    `);
};

// QR Request Email (New)
const getQRRequestEmail = (user, pickup) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #2e7d32; text-align: center; margin-bottom: 30px; font-size: 24px;">
                QR Code Request for Pickup
            </h1>

            <p style="color: #333; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                Dear ${pickup?.donor},
            </p>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #333; margin-bottom: 15px;">
                    The agency (${pickup.receiver}) has requested a QR code to complete the pickup of 
                    <strong>${pickup.quantity}kg</strong> of <strong>${pickup.wasteType}</strong> scheduled for:
                </p>

                <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p style="margin: 5px 0;">
                        <strong>Date:</strong> ${new Date(pickup.confirmedDate.date).toLocaleDateString()}
                    </p>
                    <p style="margin: 5px 0;">
                        <strong>Time:</strong> ${pickup.confirmedDate.timeSlot}
                    </p>
                </div>

                <p style="color: #333; margin-bottom: 15px;">
                    Please generate the QR code when the agency representative arrives for pickup. 
                    You have a maximum of 3 attempts to generate the QR code.
                </p>
            </div>

            <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0; margin-bottom: 15px;">Important Notes:</h3>
                <ul style="color: #1b5e20; padding-left: 20px; margin: 0;">
                    <li style="margin-bottom: 10px;">Each QR code is valid for <strong>5 minutes only</strong></li>
                    <li style="margin-bottom: 10px;">You can generate up to <strong>3 QR codes</strong></li>
                    <li style="margin-bottom: 10px;">Generate the QR code only when the agency representative is present</li>
                </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/donor/pickups" 
                   style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    View Pickup Details
                </a>
            </div>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
            <p>This is an automated message, please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} SustainFLOW. All rights reserved.</p>
        </div>
    </div>
`;

// Pickup Completion Email (Legacy)
const getPickupCompletionEmailLegacy = (user, pickupDetails, points) => {
    return baseEmailTemplate(`
        <h2 style="color: #2e7d32; text-align: center;">Pickup Completed Successfully</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Dear ${user.name},</p>
            <p>Your donation pickup has been completed successfully!</p>
            
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Pickup ID:</strong> ${pickupDetails.pickupId}</p>
                <p><strong>Date:</strong> ${new Date(pickupDetails.date).toLocaleDateString()}</p>
                <p><strong>Points Earned:</strong> ${points}</p>
            </div>

            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>What's Next?</strong></p>
                <ul>
                    <li>Check your updated points balance</li>
                    <li>Browse available rewards</li>
                    <li>Schedule your next donation</li>
                </ul>
            </div>

            <p style="text-align: center; margin-top: 20px;">
                Thank you for contributing to a sustainable future!
            </p>
        </div>
    `);
};

// Pickup Completion Email (New)
const getPickupCompletionEmail = (user, pickup, role) => {
    const feedbackUrl = `${process.env.FRONTEND_URL}/feedback/${pickup._id}`;
    
    const content = `
        <div style="padding: 20px;">
            <h2 style="color: #2e7d32;">Pickup Completed Successfully!</h2>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">Pickup Details</h3>
                <ul style="color: #333; line-height: 1.6;">
                    ${role === 'donor' ? 
                        `<li><strong>Agency:</strong> ${pickup.receiver}</li>` : 
                        `<li><strong>Donor:</strong> ${pickup.donor}</li>`
                    }
                    <li><strong>Date:</strong> ${new Date(pickup.completedAt).toLocaleDateString()}</li>
                    <li><strong>Time:</strong> ${new Date(pickup.completedAt).toLocaleTimeString()}</li>
                    <li><strong>Waste Type:</strong> ${pickup.wasteType}</li>
                    <li><strong>Quantity:</strong> ${pickup.quantity} kg</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <p style="color: #666; margin-bottom: 20px;">
                    We value your feedback! Please take a moment to share your experience.
                </p>
                <a href="${feedbackUrl}" 
                   style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    Share Your Feedback
                </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666;">
                    Thank you for contributing to sustainable waste management!
                </p>
            </div>
        </div>
    `;

    return baseEmailTemplate(content);
};

// Points Earned Email
const getPointsEarnedEmail = (user, points, agency) => {
    // Email template for points earned
};

// Points Added Email
const getPointsAddedEmail = (donor, pickup, points) => {
    const content = `
        <div style="padding: 20px;">
            <h2 style="color: #2c3e50;">Points Added to Your Account!</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p>Additional points have been added to your account for pickup completion:</p>
                
                <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
                    <h2 style="color: #2e7d32; margin: 0;">+${points} Points</h2>
                </div>

                <ul style="color: #666;">
                    <li>Pickup ID: ${pickup._id}</li>
                    <li>Quantity: ${pickup.quantity} kg</li>
                    <li>Completed by: ${pickup.receiver}</li>
                </ul>
            </div>

            <p style="color: #666;">
                Thank you for your contribution to sustainable waste management!
            </p>
        </div>
    `;

    return baseEmailTemplate(content);
};

// Successful Pickup Email
const getSuccessfulPickupEmail = (user, data, isAgency = false) => {
    const content = `
        <div>
            <h2 style="color: #2e7d32;">Pickup Completed Successfully</h2>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">Pickup Details</h3>
                <ul style="color: #333; line-height: 1.6;">
                    ${isAgency ? 
                        `<li><strong>Donor:</strong> ${data.donor}</li>` : 
                        `<li><strong>Agency:</strong> ${data.receiver}</li>`
                    }
                    <li><strong>Date:</strong> ${new Date(data.confirmedDate.date).toLocaleDateString()}</li>
                    <li><strong>Time Slot:</strong> ${data.confirmedDate.timeSlot}</li>
                    ${!isAgency ? `<li><strong>Points Earned:</strong> ${data.additionalPoints}</li>
                    <li><strong>Total Points:</strong> ${data.currentPoints}</li>` : ''}
                </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/${isAgency ? 'agency' : 'donor'}/pickups" 
                   style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    View All Pickups
                </a>
            </div>
        </div>
    `;

    return baseEmailTemplate(content);
};

// Export all functions
export {
    getPickupConfirmationEmail as getPickupConfirmedEmail,
    getPickupProposalEmailLegacy,
    getPickupConfirmationEmailLegacy,
    getQRRequestEmailLegacy,
    getPickupCompletionEmailLegacy,
    getPickupProposalEmail,
    getPickupConfirmationEmail,
    getQRRequestEmail,
    getPickupCompletionEmail,
    getPointsEarnedEmail,
    getPointsAddedEmail,
    getSuccessfulPickupEmail
};