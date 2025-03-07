import { baseEmailTemplate } from './baseTemplate.js';

export const getVerificationEmailTemplate = (status, data) => {
    let content;

    if (status === 'approved') {
        content = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1 style="color: #2e7d32;">Account Verified!</h1>
                <p>Dear ${data.username},</p>
                <p>Your account has been verified successfully. You can now log in to access all features.</p>
                ${data.temporaryPassword ? `
                    <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                        <p><strong>Your temporary password:</strong> ${data.temporaryPassword}</p>
                        <p>Please change this password after your first login.</p>
                    </div>
                ` : ''}
                <p>Thank you for joining our platform!</p>
            </div>
        `;
    } else if (status === 'rejected') {
        const resubmissionUrl = `${process.env.FRONTEND_URL}/resubmit-document/${data.resubmissionToken}`;
        content = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1 style="color: #e53935;">Document Verification Rejected</h1>
                <p>Dear ${data.username},</p>
                <p>We regret to inform you that your document verification has been rejected.</p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                    <p><strong>Reason for rejection:</strong></p>
                    <p>${data.comments || 'No specific reason provided.'}</p>
                </div>
                <p>You can submit a new document for verification through the following link:</p>
                <div style="margin: 20px 0;">
                    <a href="${resubmissionUrl}" style="background-color: #e53935; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Resubmit Document</a>
                </div>
                <p>If you have any questions, please contact our support team.</p>
            </div>
        `;
    } else {
        content = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h1 style="color: #1976d2;">Verification Update</h1>
                <p>Dear ${data.username},</p>
                <p>There has been an update regarding your account verification:</p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
                    ${data.message || 'Your verification is pending or requires additional information.'}
                </div>
                <p>If you have any questions, please contact our support team.</p>
            </div>
        `;
    }

    return baseEmailTemplate(content);
};