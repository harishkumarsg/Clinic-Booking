// Email Service using SendGrid and Nodemailer (fallback)

import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Nodemailer fallback (for development without SendGrid)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    : undefined,
});

export interface BookingEmailData {
  patientName: string;
  patientEmail: string;
  doctorName: string;
  serviceName: string;
  date: string;
  time: string;
  location: string;
  bookingId: string;
  fee: number;
}

export class EmailService {
  /**
   * Send booking confirmation email
   */
  static async sendBookingConfirmation(data: BookingEmailData): Promise<void> {
    const {
      patientName,
      patientEmail,
      doctorName,
      serviceName,
      date,
      time,
      location,
      bookingId,
      fee,
    } = data;

    const subject = `Appointment Confirmed - ${doctorName}`;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); padding: 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .greeting { font-size: 18px; color: #333; margin-bottom: 20px; }
    .confirmation { background-color: #f0fdfa; border-left: 4px solid #14b8a6; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .detail-row { display: flex; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { font-weight: 600; color: #64748b; width: 140px; }
    .detail-value { color: #333; flex: 1; }
    .booking-id { background-color: #fff7ed; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .booking-id-label { font-size: 12px; color: #78716c; text-transform: uppercase; margin-bottom: 5px; }
    .booking-id-value { font-size: 18px; font-weight: bold; color: #f59e0b; font-family: monospace; }
    .important-info { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .important-info ul { margin: 10px 0; padding-left: 20px; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
    .checkmark { color: #14b8a6; font-size: 48px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="checkmark">✓</div>
      <h1>Appointment Confirmed!</h1>
    </div>
    
    <div class="content">
      <div class="greeting">Dear ${patientName},</div>
      
      <div class="confirmation">
        <p style="margin: 0; color: #14b8a6; font-weight: 600;">Your appointment has been successfully confirmed.</p>
      </div>

      <h3 style="color: #333; margin-top: 30px;">Appointment Details</h3>
      
      <div class="detail-row">
        <div class="detail-label">Doctor:</div>
        <div class="detail-value">${doctorName}</div>
      </div>
      
      <div class="detail-row">
        <div class="detail-label">Service:</div>
        <div class="detail-value">${serviceName}</div>
      </div>
      
      <div class="detail-row">
        <div class="detail-label">Date:</div>
        <div class="detail-value">${date}</div>
      </div>
      
      <div class="detail-row">
        <div class="detail-label">Time:</div>
        <div class="detail-value">${time}</div>
      </div>
      
      <div class="detail-row">
        <div class="detail-label">Location:</div>
        <div class="detail-value">${location}</div>
      </div>
      
      <div class="detail-row" style="border-bottom: none;">
        <div class="detail-label">Consultation Fee:</div>
        <div class="detail-value" style="font-weight: 600; color: #14b8a6;">From ₹${fee}</div>
      </div>

      <div class="booking-id">
        <div class="booking-id-label">Booking Reference</div>
        <div class="booking-id-value">${bookingId}</div>
      </div>

      <div class="important-info">
        <strong style="color: #92400e;">⏰ Important Reminders:</strong>
        <ul style="color: #78350f;">
          <li>Please arrive 15 minutes early</li>
          <li>Bring a valid ID and any medical reports</li>
          <li>Free cancellation up to 24 hours before</li>
        </ul>
      </div>

      <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
        If you need to reschedule or cancel, please contact us at least 24 hours in advance.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 5px 0;">Dr. Sindhu's Skin Clinic</p>
      <p style="margin: 5px 0;">${location}</p>
      <p style="margin: 5px 0; color: #94a3b8;">This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `
Dear ${patientName},

Your appointment has been confirmed!

APPOINTMENT DETAILS:
Doctor: ${doctorName}
Service: ${serviceName}
Date: ${date}
Time: ${time}
Location: ${location}
Consultation Fee: From ₹${fee}

Booking Reference: ${bookingId}

IMPORTANT REMINDERS:
• Please arrive 15 minutes early
• Bring a valid ID and any medical reports
• Free cancellation up to 24 hours before

Thank you for choosing Dr. Sindhu's Skin Clinic.

---
This is an automated email. Please do not reply.
    `;

    try {
      // Try SendGrid first
      if (process.env.SENDGRID_API_KEY) {
        console.log(`📧 Attempting to send email via SendGrid to ${patientEmail}...`);
        console.log(`   From: ${process.env.EMAIL_FROM || 'noreply@drsindhusclinic.com'}`);
        
        await sgMail.send({
          to: patientEmail,
          from: process.env.EMAIL_FROM || 'noreply@drsindhusclinic.com',
          subject,
          text: textContent,
          html: htmlContent,
        });
        console.log(`✅ Booking confirmation email sent to ${patientEmail} via SendGrid`);
      } 
      // Fallback to Nodemailer (for development)
      else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log(`📧 Attempting to send email via Nodemailer to ${patientEmail}...`);
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || 'noreply@drsindhusclinic.com',
          to: patientEmail,
          subject,
          text: textContent,
          html: htmlContent,
        });
        console.log(`✅ Booking confirmation email sent to ${patientEmail} via Nodemailer`);
      } 
      // Log only (development without email service)
      else {
        console.log('📧 EMAIL (DEV MODE - not actually sent):', {
          to: patientEmail,
          subject,
          bookingId,
        });
        console.log('⚠️  To enable emails, add SENDGRID_API_KEY or EMAIL_USER/EMAIL_PASS to .env.local');
      }
    } catch (error: any) {
      console.error('❌ Failed to send email:');
      console.error('   Error:', error.message);
      console.error('   Code:', error.code);
      console.error('   Response:', error.response?.body);
      // Don't throw - email failure shouldn't break booking
    }
  }

  /**
   * Send cancellation email
   */
  static async sendCancellationEmail(data: BookingEmailData): Promise<void> {
    const { patientName, patientEmail, doctorName, date, time, bookingId } = data;

    const subject = `Appointment Cancelled - ${bookingId}`;
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center; color: white; }
    .content { padding: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Appointment Cancelled</h1>
    </div>
    <div class="content">
      <p>Dear ${patientName},</p>
      <p>Your appointment with <strong>${doctorName}</strong> on <strong>${date}</strong> at <strong>${time}</strong> has been cancelled.</p>
      <p>Booking Reference: <strong>${bookingId}</strong></p>
      <p>If you'd like to reschedule, please visit our website or contact us.</p>
    </div>
  </div>
</body>
</html>
    `;

    try {
      if (process.env.SENDGRID_API_KEY) {
        await sgMail.send({
          to: patientEmail,
          from: process.env.EMAIL_FROM || 'noreply@drsindhusclinic.com',
          subject,
          html: htmlContent,
        });
        console.log(`✅ Cancellation email sent to ${patientEmail}`);
      } else {
        console.log('📧 CANCELLATION EMAIL (DEV MODE - not sent):', { to: patientEmail, bookingId });
      }
    } catch (error) {
      console.error('❌ Failed to send cancellation email:', error);
    }
  }
}
