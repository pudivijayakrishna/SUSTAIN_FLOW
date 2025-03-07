import { sendMail } from '../config/mailer.js';
import { getVerificationEmailTemplate } from '../mailTemplates/verificationStatus.js';
import { baseEmailTemplate } from '../mailTemplates/baseTemplate.js';
import jwt from 'jsonwebtoken';
import { secretKey } from '../config/jwtConfig.js';

// Import welcome email templates from welcomeEmails.js instead of index.js
import {
    getDonorWelcomeEmail,
    getNGOWelcomeEmail,
    getAgencyWelcomeEmail,
    getVerificationApprovedEmail
} from '../mailTemplates/welcomeEmails.js';

// Import other email templates
import {
    getDonationRequestEmail,
    getDonationAcceptanceEmail,
    getDonationRejectionEmail,
    getDateProposalEmail,
    getQRCodeRequestEmail,
    getQRCodeGenerationEmail
} from '../mailTemplates/donationEmails.js';

import {
    getPickupProposalEmail,
    getPickupConfirmationEmail,
    getPickupCompletionEmail,
    getPointsEarnedEmail,
    getQRRequestEmail,
    getSuccessfulPickupEmail,
    getPointsAddedEmail
} from '../mailTemplates/pickupEmails.js';

import {
    getRewardRedemptionConfirmation,
    getRewardRedemptionRequest,
    getRewardApprovalEmail,
    getRewardRejectionEmail
} from '../mailTemplates/rewardEmails.js';

// Welcome email
export const sendWelcomeEmail = async (user) => {
    try {
        console.log('Attempting to send welcome email to:', user);
        let htmlContent;
        
        if (user.role === 'ngo') {
            htmlContent = getNGOWelcomeEmail(user);
        } else if (user.role === 'compostAgency') {
            htmlContent = getAgencyWelcomeEmail(user);
        } else {
            htmlContent = getDonorWelcomeEmail(user);
        }
        
        console.log('Generated welcome email content');
        
        await sendMail(
            user.email,
            `Welcome to SustainFlow, ${user.name}!`,
            null,
            htmlContent
        );
        
        console.log('Welcome email sent successfully to:', user.email);
    } catch (error) {
        console.error('Error sending welcome email:', error);
        console.error('Error details:', {
            user: user.email,
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack
        });
        throw error;
    }
};

// Verification email
export const sendVerificationEmail = async (userOrData) => {
    try {
        if (!userOrData.email) {
            throw new Error('Recipient email is required');
        }

        console.log('Preparing verification email:', {
            email: userOrData.email,
            status: userOrData.status,
            username: userOrData.username,
            role: userOrData.role
        });

        let htmlContent;
        const status = userOrData.status;

        if (status === 'approved') {
            console.log('Generating approved email template with temp password:', !!userOrData.temporaryPassword);
            
            htmlContent = getVerificationEmailTemplate('approved', {
                username: userOrData.username,
                temporaryPassword: userOrData.temporaryPassword,
                role: userOrData.role
            });

            console.log('Sending approval email to:', userOrData.email);
            await sendMail(
                userOrData.email,
                'Account Verification Approved - Login Credentials',
                null,
                htmlContent
            );

            console.log('Approval email sent successfully with temporary password');
        } else if (status === 'rejected') {
            // Generate a secure resubmission token
            const resubmissionToken = jwt.sign(
                {
                    username: userOrData.username,
                    email: userOrData.email,
                    purpose: 'resubmission'
                },
                secretKey,
                { expiresIn: '24h' }
            );

            console.log('Generated resubmission token for rejected verification');

            htmlContent = getVerificationEmailTemplate('rejected', {
                username: userOrData.username,
                comments: userOrData.rejectionReason,
                remainingAttempts: 3 - (userOrData.submissionAttempts || 0),
                resubmissionToken: resubmissionToken
            });

            console.log('Sending rejection email to:', userOrData.email);
            await sendMail(
                userOrData.email,
                'Document Verification Update',
                null,
                htmlContent
            );

            console.log('Rejection email sent successfully');
        }
    } catch (error) {
        console.error('Error sending verification email:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        throw error;
    }
};

// Verification success email with temporary password
export const sendVerificationSuccessEmail = async (user, temporaryPassword) => {
    try {
        console.log('Attempting to send verification success email to:', user.email);
        const htmlContent = getVerificationSuccessEmail(user, temporaryPassword);
        console.log('Generated verification success email content');
        
        await sendMail(
            user.email,
            `SustainFlow - Account Verification Successful`,
            null,
            htmlContent
        );
        console.log('Verification success email sent successfully to:', user.email);
    } catch (error) {
        console.error('Error sending verification success email:', error);
        console.error('Error details:', {
            user: user.email,
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack
        });
        throw error;
    }
};

// Pickup notification email
export const sendPickupEmail = async (user, type, data) => {
    try {
        const subject = type === 'request' 
            ? 'New Pickup Request'
            : 'Pickup Status Update';
            
        await sendMail(
            user.email,
            subject,
            null,
            data.html
        );
        console.log(`Pickup ${type} email sent successfully`);
    } catch (error) {
        console.error(`Error sending pickup ${type} email:`, error);
    }
};

// Pickup Confirmation Email
export const sendPickupConfirmationEmail = async (user, data) => {
    try {
        const htmlContent = getPickupConfirmationEmail(user, data);
        await sendMail(
            user.email,
            'Pickup Date Confirmed',
            null,
            htmlContent
        );
        console.log('Pickup confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending pickup confirmation email:', error);
        throw error;
    }
};

// Pickup Proposal Email
export const sendPickupProposalEmail = async (donor, data) => {
    try {
        const htmlContent = getPickupProposalEmail(donor, data);
        await sendMail(
            donor.email,
            'New Pickup Schedule Proposal',
            null,
            htmlContent
        );
        console.log('Pickup proposal email sent successfully');
    } catch (error) {
        console.error('Error sending pickup proposal email:', error);
        throw error;
    }
};

// Pickup Completion Email
export const sendPickupCompletionEmail = async (user, pickup) => {
    try {
        const htmlContent = getPickupCompletionEmail(user, pickup);
        await sendMail(
            user.email,
            'Pickup Completed Successfully',
            null,
            htmlContent
        );
        console.log('Pickup completion email sent successfully');
    } catch (error) {
        console.error('Error sending pickup completion email:', error);
        throw error;
    }
};

// Successful Pickup Email
export const sendSuccessfulPickupEmail = async (user, data, isAgency = false) => {
    try {
        const htmlContent = getSuccessfulPickupEmail(user, data, isAgency);
        await sendMail(
            user.email,
            'Pickup Completed Successfully',
            null,
            htmlContent
        );
        console.log('Successful pickup email sent successfully');
    } catch (error) {
        console.error('Error sending successful pickup email:', error);
        throw error;
    }
};

// Points Added Email
export const sendPointsAddedEmail = async (donor, pickup, points) => {
    try {
        const htmlContent = getPointsAddedEmail(donor, pickup, points);
        await sendMail(
            donor.email,
            'Points Added to Your Account',
            null,
            htmlContent
        );
        console.log('Points added email sent successfully');
    } catch (error) {
        console.error('Error sending points added email:', error);
        throw error;
    }
};

// Reward redemption email
export const sendRewardEmail = async (user, reward, agency) => {
    try {
        const htmlContent = getRewardEmail(user, reward, agency);
        await sendMail(
            agency.email,
            `Reward Redemption Request from ${user.name}`,
            null,
            htmlContent
        );
        console.log('Reward redemption email sent successfully');
    } catch (error) {
        console.error('Error sending reward redemption email:', error);
        throw error;
    }
};

// Donation response email
export const sendDonationResponseEmail = async (user, data) => {
    try {
        const htmlContent = data.status === 'approved' 
            ? getDonationAcceptanceEmail(user, data)  // Use getDonationAcceptanceEmail instead
            : getDonationRejectionEmail(user, data, data.message);
            
        const subject = `Donation Request ${data.status === 'approved' ? 'Approved' : 'Rejected'}`;
        await sendMail(
            user.email,
            subject,
            null,
            htmlContent
        );
        console.log('Donation response email sent successfully');
    } catch (error) {
        console.error('Error sending donation response email:', error);
        throw error;
    }
};

// Donation request email
export const sendDonationRequestEmail = async (user, donationDetails) => {
    try {
        const htmlContent = getDonationRequestEmail(user, donationDetails);
        await sendMail(
            user.email,
            'New Donation Request',
            null,
            htmlContent
        );
        console.log('Donation request email sent successfully');
    } catch (error) {
        console.error('Error sending donation request email:', error);
        throw error;
    }
};

// Donation acceptance email
export const sendDonationAcceptanceEmail = async (user, donationDetails) => {
    try {
        const htmlContent = getDonationAcceptanceEmail(user, donationDetails);
        await sendMail(
            user.email,
            'Donation Request Accepted',
            null,
            htmlContent
        );
        console.log('Donation acceptance email sent successfully');
    } catch (error) {
        console.error('Error sending donation acceptance email:', error);
        throw error;
    }
};

// Donation rejection email
export const sendDonationRejectionEmail = async (user, donationDetails, reason) => {
    try {
        const htmlContent = getDonationRejectionEmail(user, donationDetails, reason);
        await sendMail(
            user.email,
            'Donation Request Update',
            null,
            htmlContent
        );
        console.log('Donation rejection email sent successfully');
    } catch (error) {
        console.error('Error sending donation rejection email:', error);
        throw error;
    }
};

// Date proposal email
export const sendDateProposalEmail = async (user, dates, pickupDetails) => {
    console.log("user",user);
    console.log("dates",dates);
    console.log("pickupDetails",pickupDetails);
    
    try {
        const htmlContent = getDateProposalEmail(user, dates, pickupDetails);
        await sendMail(
            user.email,
            'Pickup Dates Proposed',
            null,
            htmlContent
        );
        console.log('Date proposal email sent successfully');
    } catch (error) {
        console.error('Error sending date proposal email:', error);
        throw error;
    }
};

// QR code request email
export const sendQRCodeRequestEmail = async (user, pickupDetails) => {
    try {
        const htmlContent = getQRCodeRequestEmail(user, pickupDetails);
        await sendMail(
            user.email,
            'QR Code Request Received',
            null,
            htmlContent
        );
        console.log('QR code request email sent successfully');
    } catch (error) {
        console.error('Error sending QR code request email:', error);
        throw error;
    }
};

// QR code generation email
export const sendQRCodeGenerationEmail = async (user, pickupDetails, qrCodeUrl) => {
    console.log("usr",user);
    
    try {
        const htmlContent =  getQRCodeGenerationEmail(user, pickupDetails, qrCodeUrl);
        await sendMail(
            user.email,
            'QR Code Generated',
            null,
            htmlContent
        );
        console.log('QR code generation email sent successfully');
    } catch (error) {
        console.error('Error sending QR code generation email:', error);
        throw error;
    }
};

// Points earned email
export const sendPointsEarnedEmail = async (user, points, agency) => {
    try {
        const htmlContent = getPointsEarnedEmail(user, points, agency);
        await sendMail(
            user.email,
            'Points Added to Your Account',
            null,
            htmlContent
        );
        console.log('Points earned email sent successfully');
    } catch (error) {
        console.error('Error sending points earned email:', error);
        throw error;
    }
};

// Reward redemption confirmation (to donor)
export const sendRewardRedemptionConfirmation = async (donor, reward, agency) => {
    try {
        const htmlContent = getRewardRedemptionConfirmation(donor, reward, agency);
        await sendMail(
            donor.email,
            'Reward Redemption Confirmation',
            null,
            htmlContent
        );
        console.log('Reward redemption confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending reward redemption confirmation email:', error);
        throw error;
    }
};

// Reward redemption request (to agency)
export const sendRewardRedemptionRequest = async (donor, reward, agency) => {
    try {
        const htmlContent = getRewardRedemptionRequest(donor, reward, agency);
        await sendMail(
            agency.email,
            `New Reward Redemption Request from ${donor.name}`,
            null,
            htmlContent
        );
        console.log('Reward redemption request email sent successfully');
    } catch (error) {
        console.error('Error sending reward redemption request email:', error);
        throw error;
    }
};

// Reward approval email
export const sendRewardApprovalEmail = async (donor, reward, agency) => {
    try {
        const htmlContent = getRewardApprovalEmail(donor, reward, agency);
        await sendMail(
            donor.email,
            'Reward Redemption Approved',
            null,
            htmlContent
        );
        console.log('Reward approval email sent successfully');
    } catch (error) {
        console.error('Error sending reward approval email:', error);
        throw error;
    }
};

// Reward rejection email
export const sendRewardRejectionEmail = async (donor, reward, agency, reason) => {
    try {
        const htmlContent = getRewardRejectionEmail(donor, reward, agency, reason);
        await sendMail(
            donor.email,
            'Reward Redemption Update',
            null,
            htmlContent
        );
        console.log('Reward rejection email sent successfully');
    } catch (error) {
        console.error('Error sending reward rejection email:', error);
        throw error;
    }
};

// QR Request Email
export const sendQRRequestEmail = async (user, pickupDetails) => {
    try {
        const htmlContent = getQRRequestEmail(user, pickupDetails);
        await sendMail(
            user.email,
            'QR Code Request Received',
            null,
            htmlContent
        );
        console.log('QR request email sent successfully');
    } catch (error) {
        console.error('Error sending QR request email:', error);
        throw error;
    }
};

// Generic email sending function
export const sendEmail = async (to, subject, html) => {
    try {
        await sendMail(to, subject, null, html);
        console.log('Email sent successfully to:', to);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};