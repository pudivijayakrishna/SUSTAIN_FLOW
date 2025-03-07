import * as nodemailer from '../utils/mailer.js';

export const suppliesRequest = async (agency, donor, data) => {
    const htmlContent = `<div style="font-family: Arial, sans-serif;">
        <h2>Request for Supplies</h2>
        <p>Dear ${agency.name},</p>
        <p>${donor.name} (${donor.email}) has requested to provide ${data.quantity} kg of supplies for composting.</p>
        <p>Please review the request and take appropriate action.</p>
        <p>Thank you.</p>
    </div>`;

    try {
        await nodemailer.sendMail(
            agency.email,
            'Request for Supplies',
            'A new supplies request has been submitted.',
            htmlContent
        );
        console.log('Supplies request email sent successfully');
    } catch (error) {
        console.error('Error while sending the supplies request email: ', error);
    }
};
