import { sendMail } from '../utils/mailer.js';
import ejs from 'ejs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const redeemReward = async (agency, donor, reward) => {
    try {
        // Render the EJS template
        const templatePath = path.join(__dirname, '../mailTemplates/rewardRedeem.ejs');
        const htmlString = await ejs.renderFile(templatePath, {
            donor: donor,
            reward: reward
        });

        // Send email using the OAuth2 configured mailer
        await sendMail(
            agency.email,
            'Reward Redemption Request',
            null,  // text is null since we're using HTML
            'reward-redeem',  // custom role for this email type
            htmlString  // pass the rendered HTML
        );

        console.log('Reward redemption email sent successfully');
    } catch (error) {
        console.error('Error sending reward redemption email:', error);
        throw error;
    }
};