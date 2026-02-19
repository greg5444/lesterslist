// src/config/email.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
/**
 * Send email notification to admin about new jam submission
 */
export async function sendJamNotification(jamData) {
    const mailOptions = {
        from: `"Lester's List" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: '🎵 New Jam Submission - Pending Approval',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3D8C95;">New Jam Submission</h2>
        <p>A new jam has been submitted and is pending approval.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #225675;">Jam Details</h3>
          <p><strong>Jam Name:</strong> ${jamData.JamName}</p>
          <p><strong>Venue:</strong> ${jamData.VenueName}</p>
          <p><strong>Schedule:</strong> ${jamData.Schedule}</p>
          ${jamData.City ? `<p><strong>City:</strong> ${jamData.City}</p>` : ''}
          ${jamData.State ? `<p><strong>State:</strong> ${jamData.State}</p>` : ''}
          ${jamData.Zip ? `<p><strong>Zip:</strong> ${jamData.Zip}</p>` : ''}
          ${jamData.AllWelcome || jamData.BeginnersWelcome || jamData.AdvancedOnly ? `
            <p><strong>Jam Level:</strong><br>
              ${jamData.AllWelcome ? '✓ All Jammers Welcome<br>' : ''}
              ${jamData.BeginnersWelcome ? '✓ Beginners Welcome<br>' : ''}
              ${jamData.AdvancedOnly ? '✓ Advanced Player Jam<br>' : ''}
            </p>
          ` : ''}
        </div>
        
        <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #225675;">Contact Information</h3>
          <p><strong>Name:</strong> ${jamData.ContactName}</p>
          <p><strong>Email:</strong> <a href="mailto:${jamData.ContactEmail}">${jamData.ContactEmail}</a></p>
          <p><strong>Phone:</strong> ${jamData.ContactPhone}</p>
          <p><strong>Show Phone Publicly:</strong> ${jamData.ShowPhone ? 'Yes' : 'No'}</p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Log in to the admin panel to approve or reject this submission.
        </p>
      </div>
    `,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Jam notification sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    }
    catch (error) {
        console.error('Error sending jam notification:', error);
        return { success: false, error: error.message };
    }
}
/**
 * Send email notification to admin about new learning resource submission
 */
export async function sendLearnNotification(resourceData) {
    const mailOptions = {
        from: `"Lester's List" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: '📚 New Learning Resource Submission - Pending Approval',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3D8C95;">New Learning Resource Submission</h2>
        <p>A new learning resource has been submitted and is pending approval.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #225675;">Resource Details</h3>
          <p><strong>Instructor/Course Name:</strong> ${resourceData.InstructorName}</p>
          <p><strong>Description:</strong><br>${resourceData.CourseDescription}</p>
          <p><strong>External Link:</strong><br>
            <a href="${resourceData.ExternalLink}" target="_blank">${resourceData.ExternalLink}</a>
          </p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Log in to the admin panel to approve or reject this submission.
        </p>
      </div>
    `,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Learn notification sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    }
    catch (error) {
        console.error('Error sending learn notification:', error);
        return { success: false, error: error.message };
    }
}
export default transporter;
