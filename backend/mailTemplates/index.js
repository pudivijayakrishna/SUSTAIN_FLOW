import { baseEmailTemplate } from './baseTemplate.js';

export const getWelcomeEmail = (user) => {
    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #2e7d32;">Welcome to SustainFlow, ${user.name}!</h1>
            <p>Thank you for joining our platform. Your account has been created successfully.</p>
            <p>You can now log in and start using our services.</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Role:</strong> ${user.role}</p>
            </div>
        </div>
    `;
    return baseEmailTemplate(content);
};

export const getVerificationEmail = (user, status, data) => {
    let content;
    
    if (status === 'approved') {
        content = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1 style="color: #2e7d32;">Account Verified!</h1>
                <p>Dear ${user.username},</p>
                <p>Your account has been verified successfully. You can now log in to access all features.</p>
                ${data?.temporaryPassword ? `
                    <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                        <p><strong>Your temporary password:</strong> ${data.temporaryPassword}</p>
                        <p>Please change this password after your first login.</p>
                    </div>
                ` : ''}
                <div style="margin-top: 20px;">
                    <p><strong>Username:</strong> ${user.username}</p>
                    <p><strong>Role:</strong> ${user.role}</p>
                </div>
                <p>Thank you for joining our platform!</p>
            </div>
        `;
    } else if (status === 'rejected') {
        content = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1 style="color: #e53935;">Document Verification Rejected</h1>
                <p>Dear ${user.username},</p>
                <p>We regret to inform you that your document verification has been rejected.</p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                    <p><strong>Reason for rejection:</strong></p>
                    <p>${data?.rejectionReason || 'No specific reason provided.'}</p>
                </div>
                <p>You can submit a new document for verification through your account dashboard.</p>
                <p>If you have any questions, please contact our support team.</p>
            </div>
        `;
    } else {
        content = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1 style="color: #1976d2;">Verification Update</h1>
                <p>Dear ${user.username},</p>
                <p>There has been an update regarding your account verification:</p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                    ${data?.message || 'Your verification is pending or requires additional information.'}
                </div>
                <p>If you have any questions, please contact our support team.</p>
            </div>
        `;
    }
    
    return baseEmailTemplate(content);
};

export const getRewardEmail = (user, reward, agency) => {
    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #2e7d32;">Reward Redemption Request</h1>
            <p>A new reward redemption request has been received:</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                <p><strong>User:</strong> ${user.name} (${user.username})</p>
                <p><strong>Reward:</strong> ${reward.name}</p>
                <p><strong>Points:</strong> ${reward.point}</p>
            </div>
            <p>Please process this request at your earliest convenience.</p>
        </div>
    `;
    return baseEmailTemplate(content);
};

export const getDonationResponseEmail = (user, data) => {
    console.log("");
    
    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #2e7d32;">Donation Request ${data.status === 'approved' ? 'Approved' : 'Rejected'}</h1>
            <p>Dear ${user.name},</p>
            <p>Your donation request has been ${data.status}.</p>
            ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
            <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                <p><strong>Items:</strong> ${data.items}</p>
                ${data.points ? `<p><strong>Points Earned:</strong> ${data.points}</p>` : ''}
            </div>
            <p>Thank you for your contribution to our community!</p>
        </div>
    `;
    return baseEmailTemplate(content);
};

export const getPickupProposalEmail = (user, data) => {
    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #2e7d32;">Pickup Schedule Proposal</h1>
            <p>Dear ${user.name},</p>
            <p>${data.receiverName} has proposed the following dates for your pickup:</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                ${data.proposedDates.map(date => `
                    <p><strong>Date:</strong> ${new Date(date.date).toLocaleDateString()}</p>
                    <p><strong>Time Slot:</strong> ${date.timeSlot}</p>
                `).join('<hr style="border: 1px solid #ddd; margin: 10px 0;">')}
            </div>
            <p>Please log in to your account to confirm your preferred date and time.</p>
        </div>
    `;
    return baseEmailTemplate(content);
};

export const getPasswordResetEmail = (user, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #2e7d32;">Password Reset Request</h1>
            <p>Dear ${user.name},</p>
            <p>You have requested to reset your password. Click the button below to reset it:</p>
            <div style="margin: 20px 0;">
                <a href="${resetUrl}" style="background-color: #2e7d32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            </div>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
        </div>
    `;
    return baseEmailTemplate(content);
};

export const getPasswordResetSuccessEmail = (user) => {
    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #2e7d32;">Password Reset Successful</h1>
            <p>Dear ${user.name},</p>
            <p>Your password has been successfully reset.</p>
            <p>If you didn't make this change, please contact support immediately.</p>
        </div>
    `;
    return baseEmailTemplate(content);
};

export const getOTPTemplate = (data) => {
    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #2e7d32;">Your OTP Code</h1>
            <p>You have requested an OTP for document resubmission.</p>
            <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px; text-align: center;">
                <h2 style="color: #2e7d32; font-size: 32px; letter-spacing: 5px;">${data.otp}</h2>
            </div>
            <p>This OTP will expire in 2 minutes.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
        </div>
    `;
    return baseEmailTemplate(content);
};

export const getAgencyDonationRequest = (receiver, donor, data) => {
    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #2e7d32;">New Donation Request</h1>
            <p>Dear ${receiver.name},</p>
            <p>You have received a new donation request from ${donor.name}.</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                <p><strong>Type:</strong> ${data.type}</p>
                <p><strong>Quantity:</strong> ${data.quantity}kg</p>
                ${data.wasteType ? `<p><strong>Waste Type:</strong> ${data.wasteType}</p>` : ''}
                ${data.itemType ? `<p><strong>Item Type:</strong> ${data.itemType}</p>` : ''}
                ${data.description ? `<p><strong>Description:</strong> ${data.description}</p>` : ''}
            </div>
            <p>Please log in to your account to review and respond to this request.</p>
        </div>
    `;
    return baseEmailTemplate(content);
};

export const getDonorRequestConfirmation = (donor, receiver, data) => {
    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #2e7d32;">Donation Request Sent</h1>
            <p>Dear ${donor.name},</p>
            <p>Your donation request has been sent to ${receiver.name}.</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                <p><strong>Type:</strong> ${data.type}</p>
                <p><strong>Quantity:</strong> ${data.quantity}kg</p>
                ${data.wasteType ? `<p><strong>Waste Type:</strong> ${data.wasteType}</p>` : ''}
                ${data.itemType ? `<p><strong>Item Type:</strong> ${data.itemType}</p>` : ''}
                ${data.description ? `<p><strong>Description:</strong> ${data.description}</p>` : ''}
            </div>
            <p>You will be notified when they respond to your request.</p>
        </div>
    `;
    return baseEmailTemplate(content);
};

export const getPickupEmail = (user, type, data) => {
    let title, message;
    
    switch (type) {
        case 'request':
            title = 'New Pickup Request';
            message = `${data.donorName} has requested a pickup for ${data.quantity}kg of ${data.wasteType || data.itemType}.`;
            break;
        case 'proposed':
            title = 'Pickup Dates Proposed';
            message = `${data.receiverName} has proposed dates for your pickup request.`;
            break;
        case 'confirmed':
            title = 'Pickup Date Confirmed';
            message = `The pickup has been scheduled for ${new Date(data.confirmedDate).toLocaleDateString()} at ${data.confirmedTimeSlot}.`;
            break;
        case 'completed':
            title = 'Pickup Completed';
            message = 'Your pickup has been completed successfully.';
            break;
        default:
            title = 'Pickup Update';
            message = 'There has been an update to your pickup request.';
    }

    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #2e7d32;">${title}</h1>
            <p>Dear ${user.name},</p>
            <p>${message}</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                ${data.quantity ? `<p><strong>Quantity:</strong> ${data.quantity}kg</p>` : ''}
                ${data.wasteType ? `<p><strong>Waste Type:</strong> ${data.wasteType}</p>` : ''}
                ${data.itemType ? `<p><strong>Item Type:</strong> ${data.itemType}</p>` : ''}
                ${data.description ? `<p><strong>Description:</strong> ${data.description}</p>` : ''}
                ${data.proposedDates ? `
                    <p><strong>Proposed Dates:</strong></p>
                    ${data.proposedDates.map(date => `
                        <div style="margin-left: 15px;">
                            <p>Date: ${new Date(date.date).toLocaleDateString()}</p>
                            <p>Time Slot: ${date.timeSlot}</p>
                        </div>
                    `).join('<hr style="border: 1px solid #ddd; margin: 10px 0;">')}
                ` : ''}
                ${data.confirmedDate ? `
                    <p><strong>Confirmed Date:</strong> ${new Date(data.confirmedDate).toLocaleDateString()}</p>
                    <p><strong>Time Slot:</strong> ${data.confirmedTimeSlot}</p>
                ` : ''}
                ${data.points ? `<p><strong>Points Earned:</strong> ${data.points}</p>` : ''}
            </div>
            <p>Thank you for using our service!</p>
        </div>
    `;
    return baseEmailTemplate(content);
};

export const getVerificationSuccessEmail = (user, temporaryPassword) => {
    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #2e7d32;">Document Verification Successful!</h1>
            <p>Dear ${user.name},</p>
            <p>Your account documents have been verified successfully. You can now log in to SustainFlow using the following credentials:</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
            </div>

            <p style="color: #d32f2f;"><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
            
            <div style="margin-top: 20px;">
                <p><strong>Account Details:</strong></p>
                <ul>
                    <li>Role: ${user.role}</li>
                    <li>Email: ${user.email}</li>
                </ul>
            </div>

            <p>Thank you for joining SustainFlow. We look forward to working with you!</p>
        </div>
    `;
    return baseEmailTemplate(content);
};

// Add other email templates here...

export const getAgencyWelcomeEmail = (user) => {
    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #2e7d32;">Welcome to SustainFlow, ${user.name}!</h1>
            <p>Thank you for joining our platform as an agency. Your account has been created successfully.</p>
            <p>You can now log in and start using our services.</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Role:</strong> ${user.role}</p>
            </div>
        </div>
    `;
    return baseEmailTemplate(content);
};

export const getDonorWelcomeEmail = (user) => {
    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #2e7d32;">Welcome to SustainFlow, ${user.name}!</h1>
            <p>Thank you for joining our platform as a donor. Your account has been created successfully.</p>
            <p>You can now log in and start using our services.</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Role:</strong> ${user.role}</p>
            </div>
        </div>
    `;
    return baseEmailTemplate(content);
};

export const getNGOWelcomeEmail = (user) => {
    const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="color: #2e7d32;">Welcome to SustainFlow, ${user.name}!</h1>
            <p>Thank you for joining our platform as an NGO. Your account has been created successfully.</p>
            <p>You can now log in and start using our services.</p>
            <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Role:</strong> ${user.role}</p>
            </div>
        </div>
    `;
    return baseEmailTemplate(content);
};