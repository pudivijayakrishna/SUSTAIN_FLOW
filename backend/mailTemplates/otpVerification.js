export const getOTPTemplate = (data) => {
    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50; text-align: center;">Document Resubmission OTP</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p>Your One-Time Password (OTP) for document resubmission is:</p>
                
                <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
                    <h1 style="color: #2e7d32; margin: 0; font-size: 32px; letter-spacing: 5px;">
                        ${data.otp}
                    </h1>
                </div>
                
                <p><strong>Note:</strong></p>
                <ul style="color: #666;">
                    <li>This OTP will expire in 2 minutes</li>
                    <li>Please do not share this OTP with anyone</li>
                </ul>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 12px; margin-top: 20px;">
                <p>If you didn't request this OTP, please ignore this email.</p>
            </div>
        </div>
    `;
}; 