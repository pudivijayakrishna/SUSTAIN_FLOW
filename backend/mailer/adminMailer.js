import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Send block notification
export const sendBlockNotification = async (user, reason) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Account Block Notification',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Account Block Notification</h2>
                <p>Dear ${user.username},</p>
                <p>We regret to inform you that your account has been blocked due to the following reason:</p>
                <p style="background-color: #f8f8f8; padding: 10px; border-left: 4px solid #dc3545;">
                    ${reason}
                </p>
                <p>If you believe this is a mistake, please contact our support team.</p>
                <p>Best regards,<br>Admin Team</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

// Send unblock notification
export const sendUnblockNotification = async (user) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Account Unblock Notification',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Account Unblock Notification</h2>
                <p>Dear ${user.username},</p>
                <p>We're pleased to inform you that your account has been unblocked.</p>
                <p>You can now access all features of our platform.</p>
                <p>Best regards,<br>Admin Team</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

// Send document request notification
export const sendDocumentRequestNotification = async (user, documentList) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Additional Documents Required',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Document Request</h2>
                <p>Dear ${user.username},</p>
                <p>Please provide the following additional documents:</p>
                <ul style="background-color: #f8f8f8; padding: 15px 30px; border-left: 4px solid #0d6efd;">
                    ${documentList.map(doc => `<li>${doc}</li>`).join('')}
                </ul>
                <p>Please submit these documents through your account dashboard.</p>
                <p>Best regards,<br>Admin Team</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

// Send bulk action notification
export const sendBulkActionNotification = async (users, action, details) => {
    const emailPromises = users.map(user => {
        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: `${action.charAt(0).toUpperCase() + action.slice(1)} Action Notice`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>${action.charAt(0).toUpperCase() + action.slice(1)} Action Notice</h2>
                    <p>Dear ${user.username},</p>
                    <p>This is to inform you that your account has been affected by a bulk ${action} action.</p>
                    <p style="background-color: #f8f8f8; padding: 10px;">
                        ${details}
                    </p>
                    <p>Best regards,<br>Admin Team</p>
                </div>
            `
        };

        return transporter.sendMail(mailOptions);
    });

    return Promise.all(emailPromises);
};

// Send verification result notification
export const sendVerificationResultNotification = async (user, status, comments) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: `Account Verification ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Verification ${status.charAt(0).toUpperCase() + status.slice(1)}</h2>
                <p>Dear ${user.username},</p>
                ${status === 'approved' 
                    ? '<p style="color: #198754;">Your account verification has been approved!</p>'
                    : `<p style="color: #dc3545;">Your account verification has been rejected.</p>
                       <p>Reason: ${comments}</p>
                       <p>Please address these concerns and submit your verification again.</p>`
                }
                <p>Best regards,<br>Admin Team</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

// Send account deletion notification
export const sendDeletionNotification = async (user, reason) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Account Deletion Notice',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Account Deletion Notice</h2>
                <p>Dear ${user.username},</p>
                <p>Your account has been scheduled for deletion.</p>
                <p>Reason: ${reason}</p>
                <p style="color: #dc3545;">This action will be completed in 30 days.</p>
                <p>If you wish to cancel this action, please contact support immediately.</p>
                <p>Best regards,<br>Admin Team</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

// Add this function for donor-specific emails
export const sendDonorWelcomeEmail = async (user) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Welcome to SustainFlow!',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Welcome to SustainFlow!</h2>
                <p>Dear ${user.username},</p>
                <p>Your account has been automatically verified. You can start using our platform right away!</p>
                <p>As a donor, you can:</p>
                <ul>
                    <li>Make donations to NGOs</li>
                    <li>Send waste to compost agencies</li>
                    <li>Earn and redeem points</li>
                </ul>
                <p>Best regards,<br>Admin Team</p>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
}; 