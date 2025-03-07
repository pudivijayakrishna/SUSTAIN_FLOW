// test.js
import { sendMail } from '.config/mailer.js';

async function testEmailSend() {
    console.log('Starting email test...');
    
    const testConfig = {
        to: 'test@example.com',
        subject: 'Test Email from SustainFlow',
        text: 'Testing OAuth2 setup - plain text version',
        html: `
            <h1>Test Email</h1>
            <p>Testing OAuth2 setup - HTML version</p>
        `
    };

    try {
        console.log(`Attempting to send email to ${testConfig.to}...`);
        const result = await sendMail(
            testConfig.to,
            testConfig.subject,
            testConfig.text,
            testConfig.html
        );
        console.log('Email sent successfully:', result);
        return result;
    } catch (err) {
        console.error('Failed to send test email:', {
            error: err.message,
            stack: err.stack
        });
        throw err;
    }
}

// Run test
testEmailSend()
    .then(() => console.log('Test completed'))
    .catch(() => process.exit(1));