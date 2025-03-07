import { google } from 'googleapis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

// Use OAuth playground as redirect URI
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
});

console.log('Visit this URL to get code:', url);

async function getNewToken(authCode) {
    try {
        const { tokens } = await oauth2Client.getToken(authCode);
        console.log('Refresh Token:', tokens.refresh_token);
        console.log('Access Token:', tokens.access_token);
        return tokens;
    } catch (error) {
        console.error('Error getting token:', error.message);
        throw error;
    }
}

// Get code from command line
const authCode = process.argv[2];
if (authCode) {
    getNewToken(authCode);
} else {
    console.log('Please provide authorization code as argument');
}