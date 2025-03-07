export const baseEmailTemplate = (content, options = {}) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${options.title || 'SustainFlow - Sustainable Waste Management'}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header with Logo -->
        <tr>
            <td style="padding: 30px 0; text-align: center; background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); border-radius: 8px 8px 0 0;">
                <img src="${process.env.FRONTEND_URL}/assets/logo.png" alt="SustainFlow" width="200" style="max-width: 100%; height: auto;">
                <h1 style="color: white; margin: 10px 0 0 0; font-size: 24px;">SustainFlow</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 16px;">
                    Sustainable Waste Management Solutions
                </p>
            </td>
        </tr>

        <!-- Main Content -->
        <tr>
            <td style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                ${content}
            </td>
        </tr>

        <!-- Points System Info -->
        ${options.showPointsInfo ? `
        <tr>
            <td style="padding: 20px; background-color: #e8f5e9; border-radius: 8px; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="color: #2e7d32; margin-top: 0;">💚 Reward Points System</h3>
                <ul style="color: #1b5e20; line-height: 1.6;">
                    <li>Earn <strong>10 points</strong> for every kg of waste donated</li>
                    <li>Redeem points for exclusive rewards from our partners</li>
                    <li>Track your environmental impact in real-time</li>
                    <li>Special bonuses for consistent donations</li>
                </ul>
                ${options.showPointsBalance ? `
                <div style="background: #fff; padding: 15px; border-radius: 5px; margin-top: 15px;">
                    <p style="margin: 0; font-weight: bold; color: #2e7d32;">
                        Your Current Balance: ${options.pointsBalance} points
                    </p>
                </div>
                ` : ''}
            </td>
        </tr>
        ` : ''}

        <!-- Feedback Section -->
        ${options.showFeedback ? `
        <tr>
            <td style="padding: 20px 0;">
                <div style="text-align: center; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h3 style="color: #2e7d32; margin-top: 0;">Your Feedback Matters!</h3>
                    <p style="margin-bottom: 15px; color: #666;">Help us improve our services</p>
                    <a href="${process.env.FRONTEND_URL}/feedback/${options.feedbackToken}" 
                       style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; transition: all 0.3s ease;">
                        Rate Your Experience
                    </a>
                </div>
            </td>
        </tr>
        ` : ''}

        <!-- Footer -->
        <tr>
            <td style="padding: 30px 0; text-align: center; color: #666;">
                <!-- Impact Stats -->
                ${options.showImpactStats ? `
                <div style="margin-bottom: 30px; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <h4 style="color: #2e7d32; margin-top: 0;">Your Environmental Impact</h4>
                    <p style="margin: 5px 0;">Total Waste Saved: ${options.impactStats.wasteSaved}kg</p>
                    <p style="margin: 5px 0;">CO₂ Reduced: ${options.impactStats.co2Reduced}kg</p>
                </div>
                ` : ''}

                <!-- Social Links -->
                <div style="margin-bottom: 20px;">
                    <a href="#" style="margin: 0 10px; display: inline-block; transition: transform 0.3s ease;">
                        <img src="${process.env.FRONTEND_URL}/assets/social/facebook.png" alt="Facebook" width="32" height="32">
                    </a>
                    <a href="#" style="margin: 0 10px; display: inline-block; transition: transform 0.3s ease;">
                        <img src="${process.env.FRONTEND_URL}/assets/social/twitter.png" alt="Twitter" width="32" height="32">
                    </a>
                    <a href="#" style="margin: 0 10px; display: inline-block; transition: transform 0.3s ease;">
                        <img src="${process.env.FRONTEND_URL}/assets/social/linkedin.png" alt="LinkedIn" width="32" height="32">
                    </a>
                    <a href="#" style="margin: 0 10px; display: inline-block; transition: transform 0.3s ease;">
                        <img src="${process.env.FRONTEND_URL}/assets/social/instagram.png" alt="Instagram" width="32" height="32">
                    </a>
                </div>

                <!-- Links -->
                <div style="margin-bottom: 20px;">
                    <a href="${process.env.FRONTEND_URL}/privacy" style="color: #666; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
                    <a href="${process.env.FRONTEND_URL}/terms" style="color: #666; text-decoration: none; margin: 0 10px;">Terms of Service</a>
                    <a href="${process.env.FRONTEND_URL}/contact" style="color: #666; text-decoration: none; margin: 0 10px;">Contact Us</a>
                </div>

                <p style="margin: 0; font-size: 12px; line-height: 1.5;">
                    © ${new Date().getFullYear()} SustainFlow. All rights reserved.<br>
                    <a href="mailto:sustainflowteam@gmail.com" style="color: #4CAF50; text-decoration: none;">
                        sustainflowteam@gmail.com
                    </a>
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
`; 