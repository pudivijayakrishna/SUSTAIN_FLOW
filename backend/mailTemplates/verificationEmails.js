import { baseEmailTemplate } from './baseTemplate.js';

// Verification Status Email (Approved/Rejected)
export const getVerificationStatusEmail = (status, data) => {
    switch (status) {
        case 'approved':
            return baseEmailTemplate(`
                <h2 style="color: #2e7d32; text-align: center;">Account Verification Approved!</h2>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p>Dear ${data.username},</p>
                    <p>Your account has been verified successfully. You can now log in using the following credentials:</p>
                    
                    <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Username:</strong> ${data.username}</p>
                        <p><strong>Temporary Password:</strong> ${data.temporaryPassword}</p>
                    </div>
                    
                    <p style="color: #d32f2f; font-weight: bold;">
                        Important: You will be required to change your password upon first login.
                    </p>
                </div>
            `);

        case 'rejected':
            return baseEmailTemplate(`
                <h2 style="color: #d32f2f; text-align: center;">Verification Update</h2>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p>Dear ${data.username},</p>
                    <p>Your account verification was not approved. Please review the feedback below:</p>
                    
                    <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Reason for Rejection:</strong></p>
                        <p>${data.comments}</p>
                    </div>

                    <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Attempts Remaining:</strong> ${data.remainingAttempts}/3</p>
                        ${data.remainingAttempts > 0 ? `
                            <p>You can submit a new verification document from your profile page.</p>
                        ` : `
                            <p style="color: #d32f2f;">You have reached the maximum number of attempts. 
                            Please contact support for assistance.</p>
                        `}
                    </div>
                </div>
            `);

        default:
            return '';
    }
};

// Verification Rejection Email (with remaining attempts)
export const getVerificationRejectionEmail = (data) => {
    return baseEmailTemplate(`
        <h2 style="color: #e74c3c; text-align: center;">Document Verification Update</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Dear ${data.username},</p>
            
            <p>Your verification document has been reviewed and was not approved.</p>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Reason for Rejection:</strong></p>
                <p>${data.comments}</p>
            </div>

            ${data.remainingAttempts > 0 ? `
                <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Attempts Remaining:</strong> ${data.remainingAttempts}</p>
                    <p>You can submit new verification documents through your profile.</p>
                </div>
            ` : `
                <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p>You have reached the maximum number of attempts.</p>
                    <p>Please contact support for further assistance.</p>
                </div>
            `}
        </div>
    `);
};

// Final Rejection Email
export const getFinalRejectionEmail = (user) => {
    return baseEmailTemplate(`
        <h2 style="color: #e74c3c; text-align: center;">Final Verification Status</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Dear ${user.username},</p>
            
            <p>We regret to inform you that your account verification process has been unsuccessful after multiple attempts.</p>
            
            <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Account Status:</strong> Verification Failed</p>
                <p>You have reached the maximum number of verification attempts.</p>
            </div>

            <p>If you believe this is an error or need assistance, please contact our support team.</p>
        </div>
    `);
};

// Document Resubmission Confirmation
export const getResubmissionConfirmationEmail = (user, attemptNumber) => {
    return baseEmailTemplate(`
        <h2 style="color: #2196f3; text-align: center;">Document Resubmission Received</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Dear ${user.username},</p>
            
            <p>We have received your resubmitted verification documents.</p>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Submission Number:</strong> ${attemptNumber}/3</p>
                <p>Our team will review your documents and update you on the status.</p>
            </div>

            <p>Thank you for your patience during this process.</p>
        </div>
    `);
};