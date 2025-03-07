import { baseEmailTemplate } from './baseTemplate.js';

export const getDonorWelcomeEmail = (user) => {
    const content = `
        <div>
            <h2 style="color: #2e7d32; margin-bottom: 20px;">Welcome to SustainFlow, ${user.name}!</h2>
            
            <p style="color: #333; line-height: 1.6;">
                Thank you for joining SustainFlow! Your support helps us build a more sustainable future.
                We are excited to have you on board and look forward to your contributions in reducing food
                and electronic waste.
            </p>

            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">Getting Started</h3>
                <ul style="color: #333; line-height: 1.6;">
                    <li>Update your profile and location</li>
                    <li>Browse nearby NGOs and Compost Agencies</li>
                    <li>Start donating and earning points</li>
                    <li>Track your environmental impact</li>
                </ul>
            </div>
        </div>
    `;

    return baseEmailTemplate(content, {
        title: 'Welcome to SustainFlow',
        showPointsInfo: true,
        showFeedback: false
    });
};

export const getNGOWelcomeEmail = (user) => {
    const content = `
        <div>
            <h2 style="color: #2e7d32; margin-bottom: 20px;">Welcome to SustainFlow, ${user.name}!</h2>
            
            <p style="color: #333; line-height: 1.6;">
                Welcome to SustainFlow! We are thrilled to have your organization join us in promoting
                sustainable waste management.
            </p>

            <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #e65100; margin-top: 0;">Important Notice</h3>
                <p style="color: #333; margin-bottom: 0;">
                    YOUR DOCUMENTS ARE UNDER VERIFICATION
                </p>
                <p style="color: #333; margin-bottom: 0;">
                    Please allow 2–3 business days for admin approval.
                </p>
            </div>

            <p style="color: #333; line-height: 1.6;">
                Together, we can make a positive impact on the environment and the community.
            </p>
        </div>
    `;

    return baseEmailTemplate(content, {
        title: 'Welcome to SustainFlow - NGO Registration',
        showPointsInfo: false,
        showFeedback: false
    });
};

export const getAgencyWelcomeEmail = (user) => {
    const content = `
        <div>
            <h2 style="color: #2e7d32; margin-bottom: 20px;">Welcome to SustainFlow, ${user.name}!</h2>
            
            <p style="color: #333; line-height: 1.6;">
                We are excited to welcome you to SustainFlow! Your role in waste processing and recycling is
                essential in our mission to reduce waste and promote sustainability.
            </p>

            <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #e65100; margin-top: 0;">Important Notice</h3>
                <p style="color: #333; margin-bottom: 0;">
                    YOUR DOCUMENTS ARE UNDER VERIFICATION
                </p>
                <p style="color: #333; margin-bottom: 0;">
                    Please allow 2–3 business days for admin approval.
                </p>
            </div>

            <p style="color: #333; line-height: 1.6;">
                We look forward to collaborating with you in making our environment cleaner and more sustainable!
            </p>
        </div>
    `;

    return baseEmailTemplate(content, {
        title: 'Welcome to SustainFlow - Agency Registration',
        showPointsInfo: false,
        showFeedback: false
    });
};

export const getVerificationApprovedEmail = (user, tempPassword) => {
    const content = `
        <div>
            <h2 style="color: #2e7d32; margin-bottom: 20px;">Registration Approved!</h2>
            
            <p style="color: #333; line-height: 1.6;">
                Dear ${user.name}, we are pleased to inform you that your registration and submitted documents 
                have been successfully verified.
            </p>

            <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin-top: 0;">Your Login Credentials</h3>
                <p style="color: #333; margin-bottom: 5px;"><strong>Username:</strong> ${user.username}</p>
                <p style="color: #333; margin-bottom: 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>

            <div style="background-color: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #e65100; margin: 0;">
                    <strong>Important:</strong> Please change your password upon first login.
                </p>
            </div>
        </div>
    `;

    return baseEmailTemplate(content, {
        title: 'SustainFlow - Registration Approved',
        showPointsInfo: false,
        showFeedback: true,
        feedbackToken: user._id
    });
};