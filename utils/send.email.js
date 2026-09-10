// Bypasses the broken internal dist/esm compiler pathing
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const nodemailer = require('nodemailer');
import dotenv from 'dotenv'
dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail App Password
  },
})

export const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: `"Manuscript System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`📨 Email sent to ${to}`)
  } catch (err) {
    console.error('❌ Failed to send email:', err.message)
  }
}
