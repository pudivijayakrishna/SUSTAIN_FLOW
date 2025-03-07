import { baseEmailTemplate } from './baseTemplate.js';

// Account Status Update
export const getAccountStatusEmail = (user, status, reason) => {
    return baseEmailTemplate(`
        <h2 style="color: ${status === 'blocked' ? '#d32f2f' : '#2e7d32'}; text-align: center;">
            Account Status Update
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p>Dear ${user.name},</p>
            
            <p>Your account has been <strong>${status}</strong>.</p>
            
            ${reason ? `
                <div style="background-color: ${status === 'blocked' ? '#ffebee' : '#e8f5e9'}; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Reason:</strong></p>
                    <p>${reason}</p>
                </div>
            ` : ''}

            ${status === 'blocked' ? `
                <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="color: #e65100; margin: 0;">
                        If you believe this is a mistake, please contact our support team.
                    </p>
                </div>
            ` : ''}
        </div>
    `);
};