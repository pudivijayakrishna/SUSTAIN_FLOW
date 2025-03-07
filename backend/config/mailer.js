import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const createTransporter = async () => {
    try {
        console.log('Starting OAuth2 client creation...');
        console.log('Using Gmail:', process.env.GMAIL_USER);
        
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        console.log('OAuth2 client created, setting credentials...');
        
        oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN
        });

        console.log('Getting access token...');
        const accessToken = await oauth2Client.getAccessToken();
        console.log('Access token received');

        console.log('Creating nodemailer transport...');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.GMAIL_USER,
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                accessToken: accessToken.token
            }
        });

        console.log('Verifying transporter configuration...');
        try {
            await transporter.verify();
            console.log('Transporter verified successfully');
            return transporter;
        } catch (verifyError) {
            console.error('Transporter verification failed:', verifyError);
            throw verifyError;
        }
    } catch (error) {
        console.error('Error in createTransporter:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

export const sendMail = async (to, subject, text, html) => {
    if (!to || !subject) {
        throw new Error('Recipient and subject are required');
    }

    try {
        console.log('Creating email transporter...');
        const transporter = await createTransporter();
        console.log('Transporter created successfully');

        const mailOptions = {
            from: process.env.GMAIL_USER,
            to,
            subject,
            text,
            html
        };

        console.log('Sending email with options:', {
            to: mailOptions.to,
            subject: mailOptions.subject,
            from: mailOptions.from
        });

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Failed to send email:', error);
        console.error('Error details:', {
            to,
            subject,
            errorName: error.name,
            errorMessage: error.message,
            errorStack: error.stack
        });
        throw error;
    }
};