const nodemailer = require('nodemailer');
require('dotenv').config();

exports.sendEmail = async (options) => {
  try {
    // Requires real valid Gmail credentials in .env file to dispatch actual emails
    const smtpUser = process.env.SMTP_USER || '0satyamkumarjha2@gmail.com';
    const smtpPass = process.env.SMTP_PASS || 'wvnooyncypjwrugq';

    if (!smtpUser || !smtpPass) {
      console.error("CRITICAL ERROR: Please add your Gmail SMTP_USER and SMTP_PASS in your .env file!");
      throw new Error("SMTP credentials are not configured in the backend `.env` file. Cannot send real emails.");
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail', // Standardizing on Gmail for a free production-ready SMTP pipe
      auth: {
        user: smtpUser,
        pass: smtpPass, 
      },
    });

    const mailOptions = {
      from: `"CU Management App" <${process.env.SMTP_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2563eb;">Authentication Code</h2>
          <p>${options.message}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0" />
          <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`\n==============================================`);
    console.log(`✉️ REAL Email successfully dispatched to: ${options.email}`);
    console.log(`==============================================\n`);

  } catch (error) {
    console.error('Error sending real email:', error);
    throw error;
  }
};
