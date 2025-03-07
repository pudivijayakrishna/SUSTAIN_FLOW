// backend/routes/oauth.js

import express from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Route to initiate the OAuth flow
router.get('/authorize', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://mail.google.com/'],
    });

    res.redirect(url);
});

// Callback route to handle the OAuth2 flow
router.get('/oauth2callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('Missing authorization code');
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);
        console.log('Tokens received:', tokens);

        // Save the refresh token securely
        console.log('Your refresh token:', tokens.refresh_token);

        // Respond to the user
        res.send('Authorization successful! Check your console for the refresh token.');
    } catch (error) {
        console.error('Error retrieving tokens:', error);
        res.status(500).send('Error retrieving tokens');
    }
});

export default router;
