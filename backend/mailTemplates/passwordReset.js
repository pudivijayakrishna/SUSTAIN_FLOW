import { baseEmailTemplate } from './baseTemplate.js';

// Password Reset Request Email
export const getPasswordResetEmail = (user, resetToken) => {
    return baseEmailTemplate(`
        <h2 style="color: #2e7d32; text-align: center;">Password Reset Request</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Dear ${user.name},</p>
            <p>We received a request to reset your password.</p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" 
                   style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    Reset Password
                </a>
            </div>

            <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #e65100; margin: 0;">
                    <strong>Note:</strong> This link will expire in 1 hour for security reasons.
                    If you did not request this reset, please ignore this email.
                </p>
            </div>
        </div>
    `);
};

// Password Reset Success Email
export const getPasswordResetSuccessEmail = (user) => {
    return baseEmailTemplate(`
        <h2 style="color: #2e7d32; text-align: center;">Password Reset Successful</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Dear ${user.name},</p>
            <p>Your password has been successfully reset.</p>

            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #2e7d32; margin: 0;">
                    You can now log in to your account with your new password.
                </p>
            </div>

            <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #e65100; margin: 0;">
                    <strong>Security Tip:</strong> If you did not make this change, 
                    please contact our support team immediately.
                </p>
            </div>
        </div>
    `);
};