import { baseEmailTemplate } from './baseTemplate.js';

// Donation Request Email (to Donor)
export const getDonorRequestConfirmation = (donor, data) => {
    const content = `
        <div>
            <h2 style="color: #2e7d32; margin-bottom: 20px;">Donation Request Confirmation</h2>
            
            <p style="color: #333; line-height: 1.6;">
                Dear ${donor.name}, thank you for your contribution to sustainability! 
                Your donation request has been sent successfully.
            </p>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">Donation Details</h3>
                <ul style="color: #333; line-height: 1.6;">
                    ${data.type === 'ngo' ? `
                        <li><strong>Item Category:</strong> ${data.itemCategory}</li>
                        ${data.itemCategory === 'others' ? `<li><strong>Item Name:</strong> ${data.itemName}</li>` : ''}
                    ` : `
                        <li><strong>Waste Type:</strong> ${data.wasteType}</li>
                        <li><strong>Item Type:</strong> ${data.itemType}</li>
                    `}
                    <li><strong>Quantity:</strong> ${data.quantity} kg</li>
                    <li><strong>Description:</strong> ${data.description}</li>
                </ul>
            </div>

            <p style="color: #666; font-style: italic;">
                ${data.receiverName} (${data.type === 'ngo' ? 'NGO' : 'Compost Agency'}) will review your request shortly.
                You will receive a notification once they respond.
            </p>
        </div>
    `;

    return baseEmailTemplate(content, {
        title: 'Donation Request Confirmation',
        showPointsInfo: true,
        showImpactStats: true,
        impactStats: {
            wasteSaved: data.quantity,
            co2Reduced: Math.round(data.quantity * 2.5)
        }
    });
};

// Donation Request Email (to Agency)
export const getAgencyDonationRequest = (agency, donor, data) => {
    const content = `
        <div>
            <h2 style="color: #2e7d32; margin-bottom: 20px;">New Donation Request</h2>
            
            <p style="color: #333; line-height: 1.6;">
                Dear ${agency.name}, a new donation request has been submitted through SustainFlow.
            </p>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">Donation Details</h3>
                <ul style="color: #333; line-height: 1.6;">
                    <li><strong>Donor Name:</strong> ${donor.name}</li>
                    ${data.type === 'ngo' ? `
                        <li><strong>Item Category:</strong> ${data.itemCategory}</li>
                        ${data.itemCategory === 'others' ? `<li><strong>Item Name:</strong> ${data.itemName}</li>` : ''}
                    ` : `
                        <li><strong>Waste Type:</strong> ${data.wasteType}</li>
                        <li><strong>Item Type:</strong> ${data.itemType}</li>
                    `}
                    <li><strong>Quantity:</strong> ${data.quantity} kg</li>
                    <li><strong>Description:</strong> ${data.description}</li>
                </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/dashboard" 
                   style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    Review Request
                </a>
            </div>
        </div>
    `;

    return baseEmailTemplate(content, {
        title: 'New Donation Request',
        showFeedback: false
    });
};

// Donation Acceptance Email (to Donor)
export const getDonationAcceptanceEmail = (donor, data) => {
    const content = `
        <div>
            <h2 style="color: #2e7d32; margin-bottom: 20px;">Donation Request Accepted!</h2>
            
            <p style="color: #333; line-height: 1.6;">
                Dear ${donor.name}, your donation request has been accepted by ${data.receiverName}!
            </p>

            <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">Donation Details</h3>
                <ul style="color: #333; line-height: 1.6;">
                    ${data.type === 'ngo' ? `
                        <li><strong>Item Category:</strong> ${data.itemCategory}</li>
                        ${data.itemCategory === 'others' ? `<li><strong>Item Name:</strong> ${data.itemName}</li>` : ''}
                    ` : `
                        <li><strong>Waste Type:</strong> ${data.wasteType || 'Not specified'}</li>
                        <li><strong>Item Type:</strong> ${data.itemType || 'Not specified'}</li>
                    `}
                    <li><strong>Quantity:</strong> ${data.quantity} kg</li>
                    <li><strong>Description:</strong> ${data.description || 'No description provided'}</li>
                    <li><strong>Points Earned:</strong> ${data.points || data.quantity * 10} points</li>
                </ul>
            </div>

            <p style="color: #666;">
                The organization will contact you shortly to coordinate the pickup/delivery.
            </p>
        </div>
    `;

    return baseEmailTemplate(content, {
        title: 'Donation Accepted',
        showPointsInfo: true,
        showFeedback: true,
        feedbackToken: data._id,
        showImpactStats: true,
        impactStats: {
            wasteSaved: data.quantity,
            co2Reduced: Math.round(data.quantity * 2.5)
        }
    });
};

// Donation Rejection Email (to Donor)
export const getDonationRejectionEmail = (donor, data, reason) => {
    const content = `
        <div>
            <h2 style="color: #d32f2f; margin-bottom: 20px;">Donation Request Update</h2>
            
            <p style="color: #333; line-height: 1.6;">
                Dear ${donor.name}, thank you for your willingness to contribute to sustainability through SustainFlow.
                We regret to inform you that your donation request has been rejected by ${data.receiverName}.
            </p>

            <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #d32f2f; margin-top: 0;">Request Details</h3>
                <ul style="color: #333; line-height: 1.6;">
                    ${data.type === 'ngo' ? `
                        <li><strong>Item Category:</strong> ${data.itemCategory}</li>
                        ${data.itemCategory === 'others' ? `<li><strong>Item Name:</strong> ${data.itemName}</li>` : ''}
                    ` : `
                        <li><strong>Waste Type:</strong> ${data.wasteType}</li>
                        <li><strong>Item Type:</strong> ${data.itemType}</li>
                    `}
                    <li><strong>Quantity:</strong> ${data.quantity} kg</li>
                    ${reason ? `<li><strong>Rejection Reason:</strong> ${reason}</li>` : ''}
                </ul>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/donate" 
                   style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    Try Another Donation
                </a>
            </div>
        </div>
    `;

    return baseEmailTemplate(content, {
        title: 'Donation Request Update',
        showPointsInfo: false,  // Important: Don't show points for rejections
        showFeedback: false  // Don't show feedback option for rejections
    });
};

// Donation Request Email
export const getDonationRequestEmail = (user, donationDetails) => {
    const details = donationDetails.type === 'ngo' ? 
        `<p><strong>Item Category:</strong> ${donationDetails.itemCategory}</p>
         ${donationDetails.itemCategory === 'others' ? 
            `<p><strong>Item Name:</strong> ${donationDetails.itemName}</p>` : ''}` :
        `<p><strong>Waste Type:</strong> ${donationDetails.wasteType}</p>
         <p><strong>Item Type:</strong> ${donationDetails.itemType}</p>`;

    return baseEmailTemplate(`
        <h2 style="color: #2e7d32;">New Donation Request</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Dear ${user.name},</p>
            <p>A new donation request has been received from ${donationDetails.donorName}.</p>
            
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                ${details}
                <p><strong>Quantity:</strong> ${donationDetails.quantity} ${donationDetails.unit || 'kg'}</p>
                <p><strong>Description:</strong> ${donationDetails.description}</p>
                <p><strong>Donor:</strong> ${donationDetails.donorName} (${donationDetails.donorUsername})</p>
            </div>

            <p>Please review this request and take appropriate action.</p>
        </div>
    `, {
        title: 'New Donation Request',
        showPointsInfo: false
    });
};

// Donation Acceptance Email
export const getDonationAcceptanceEmailNew = (user, donationDetails) => {
    return baseEmailTemplate(`
        <h2 style="color: #2e7d32; text-align: center;">Donation Request Accepted</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Dear ${user.name},</p>
            <p>Your donation request has been accepted!</p>
            
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Waste Type:</strong> ${donationDetails.wasteType}</p>
                <p><strong>Item Type:</strong> ${donationDetails.itemType}</p>
                <p><strong>Agency:</strong> ${donationDetails.agencyName}</p>
            </div>

            <p>The agency will propose pickup dates shortly.</p>
        </div>
    `);
};

// Donation Rejection Email
export const getDonationRejectionEmailNew = (user, donationDetails, reason) => {
    return baseEmailTemplate(`
        <h2 style="color: #d32f2f; text-align: center;">Donation Request Update</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Dear ${user.name},</p>
            <p>We regret to inform you that your donation request could not be accepted at this time.</p>
            
            <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Reason:</strong></p>
                <p>${reason}</p>
            </div>

            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p>You can try:</p>
                <ul>
                    <li>Submitting a new request with different specifications</li>
                    <li>Choosing a different agency from your nearby list</li>
                    <li>Contacting support for assistance</li>
                </ul>
            </div>
        </div>
    `);
};

// Date Proposal Email
export const getDateProposalEmail = (user, dates, pickupDetails) => {
    console.log("dates in getDateProposalEmail",dates);
    
    const formattedDates = dates.map(dateObj => {
        const formattedDate = new Date(dateObj.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        return `<div style="margin: 10px 0;">${formattedDate} - ${dateObj.timeSlot}</div>`;
    }).join('');

    return baseEmailTemplate(`
        <h2 style="color: #2196f3; text-align: center;">Pickup Dates Proposed</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Dear ${user.name},</p>
            <p>The ${pickupDetails?.receiver ||pickupDetails?.receiverName || 'Agency/NGO'} has proposed the following dates for pickup:</p>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                ${formattedDates}
            </div>

            <p>Please log in to your account to confirm your preferred date.</p>
        </div>
    `);
};


// QR Code Request Email
export const getQRCodeRequestEmail = (user, pickupDetails) => {
    return baseEmailTemplate(`
        <h2 style="color: #2e7d32; text-align: center;">QR Code Request Received</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Dear ${user.name},</p>
            <p>Your request for a QR code has been received for the following pickup:</p>
            
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Pickup ID:</strong> ${pickupDetails.pickupId}</p>
                <p><strong>Date:</strong> ${new Date(pickupDetails.confirmedDate.date).toLocaleDateString()}-${pickupDetails.confirmedDate.timeSlot}</p>
                <p><strong>Status:</strong> Pending QR Generation</p>
            </div>

            <p>The agency will review and generate your QR code shortly.</p>
        </div>
    `);
};

// QR Code Generation Email
export const getQRCodeGenerationEmail = (user, pickupDetails, qrCodeUrl) => {
    return baseEmailTemplate(`
        <h2 style="color: #2e7d32; text-align: center;">QR Code Generated</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Dear ${user.name},</p>
            <p>Your QR code has been generated for the upcoming pickup.</p>
            
            <div style="text-align: center; margin: 20px 0;">
                <img src="${qrCodeUrl}" alt="Pickup QR Code" style="max-width: 200px;">
            </div>

            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Pickup ID:</strong> ${pickupDetails.pickupId}</p>
                <p><strong>Date:</strong> ${new Date(pickupDetails.confirmedDate.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${pickupDetails.confirmedDate.timeSlot}</p>
            </div>

            <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #e65100; margin: 0;">
                    <strong>Important:</strong> Please have this QR code ready for scanning during pickup.
                </p>
            </div>
        </div>
    `);
};

// Add this new function
export const getDonationResponseEmail = (user, data) => {
    const content = `
        <div>
            <h2 style="color: ${data.status === 'approved' ? '#2e7d32' : '#d32f2f'}; margin-bottom: 20px;">
                Donation Request ${data.status === 'approved' ? 'Approved' : 'Rejected'}
            </h2>
            
            <p style="color: #333; line-height: 1.6;">
                Dear ${user.name},
            </p>
            
            <div style="background-color: ${data.status === 'approved' ? '#e8f5e9' : '#ffebee'}; 
                        padding: 20px; 
                        border-radius: 8px; 
                        margin: 20px 0;">
                <h3 style="color: ${data.status === 'approved' ? '#2e7d32' : '#d32f2f'}; margin-top: 0;">
                    Request Details
                </h3>
                <ul style="color: #333; line-height: 1.6;">
                    <li><strong>Items:</strong> ${data.items}</li>
                    ${data.points ? `<li><strong>Points Earned:</strong> ${data.points}</li>` : ''}
                    ${data.message ? `<li><strong>Message:</strong> ${data.message}</li>` : ''}
                </ul>
            </div>

            ${data.status === 'approved' ? `
                <p style="color: #2e7d32;">
                    Your donation request has been approved. Thank you for your contribution!
                </p>
            ` : `
                <p style="color: #d32f2f;">
                    Unfortunately, your donation request could not be accepted at this time.
                </p>
            `}
        </div>
    `;

    return baseEmailTemplate(content, {
        title: `Donation Request ${data.status === 'approved' ? 'Approved' : 'Rejected'}`,
        showPointsInfo: data.status === 'approved',
        showFeedback: data.status === 'approved'
    });
};