// SMS Service using Twilio

import twilio from 'twilio';

// Initialize Twilio client
let twilioClient: ReturnType<typeof twilio> | null = null;

// Only initialize if we have valid Twilio credentials (not just empty strings)
const hasTwilioCredentials = 
  process.env.TWILIO_ACCOUNT_SID && 
  process.env.TWILIO_ACCOUNT_SID.trim().length > 0 &&
  process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
  process.env.TWILIO_AUTH_TOKEN && 
  process.env.TWILIO_AUTH_TOKEN.trim().length > 0 &&
  process.env.TWILIO_PHONE_NUMBER &&
  process.env.TWILIO_PHONE_NUMBER.trim().length > 0;

if (hasTwilioCredentials) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

export interface BookingSMSData {
  phone: string;
  patientName: string;
  doctorName: string;
  serviceName: string;
  date: string;
  time: string;
  location: string;
  bookingId: string;
}

export class SMSService {
  /**
   * Send booking confirmation SMS
   */
  static async sendBookingConfirmation(data: BookingSMSData): Promise<void> {
    const {
      phone,
      patientName,
      doctorName,
      serviceName,
      date,
      time,
      location,
      bookingId,
    } = data;

    // Format phone number for India (ensure +91 prefix)
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.startsWith('91')
        ? `+${formattedPhone}`
        : `+91${formattedPhone.replace(/^0+/, '')}`;
    }

    const message = `Dear ${patientName.split(' ')[0]},

Your appointment is confirmed!

Doctor: ${doctorName}
Date: ${date}
Time: ${time}
Location: ${location}

Booking ID: ${bookingId}

Please arrive 15 mins early.

- Dr. Sindhu's Skin Clinic`;

    try {
      if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        const response = await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone,
        });

        console.log(`✅ SMS sent to ${formattedPhone}. SID: ${response.sid}`);
      } else {
        // Development mode - just log
        console.log('📱 SMS (DEV MODE - not actually sent):', {
          to: formattedPhone,
          preview: message.substring(0, 100) + '...',
          bookingId,
        });
        console.log('⚠️  To enable SMS, add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to .env.local');
      }
    } catch (error) {
      console.error('❌ Failed to send SMS:', error);
      // Don't throw - SMS failure shouldn't break booking
    }
  }

  /**
   * Send appointment reminder SMS (1 day before)
   */
  static async sendAppointmentReminder(data: BookingSMSData): Promise<void> {
    const {
      phone,
      patientName,
      doctorName,
      date,
      time,
      location,
      bookingId,
    } = data;

    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.startsWith('91')
        ? `+${formattedPhone}`
        : `+91${formattedPhone.replace(/^0+/, '')}`;
    }

    const message = `Reminder: Tomorrow's Appointment

Hi ${patientName.split(' ')[0]},

Your appointment is scheduled for:
📅 ${date} at ${time}
👨‍⚕️ ${doctorName}
📍 ${location}

Booking ID: ${bookingId}

See you tomorrow!
- Dr. Sindhu's Skin Clinic`;

    try {
      if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone,
        });
        console.log(`✅ Reminder SMS sent to ${formattedPhone}`);
      } else {
        console.log('📱 REMINDER SMS (DEV MODE):', { to: formattedPhone, bookingId });
      }
    } catch (error) {
      console.error('❌ Failed to send reminder SMS:', error);
    }
  }

  /**
   * Send cancellation SMS
   */
  static async sendCancellationSMS(data: BookingSMSData): Promise<void> {
    const { phone, patientName, doctorName, date, time, bookingId } = data;

    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.startsWith('91')
        ? `+${formattedPhone}`
        : `+91${formattedPhone.replace(/^0+/, '')}`;
    }

    const message = `Appointment Cancelled

Hi ${patientName.split(' ')[0]},

Your appointment with ${doctorName} on ${date} at ${time} has been cancelled.

Booking ID: ${bookingId}

To reschedule, visit our website.

- Dr. Sindhu's Skin Clinic`;

    try {
      if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: formattedPhone,
        });
        console.log(`✅ Cancellation SMS sent to ${formattedPhone}`);
      } else {
        console.log('📱 CANCELLATION SMS (DEV MODE):', { to: formattedPhone, bookingId });
      }
    } catch (error) {
      console.error('❌ Failed to send cancellation SMS:', error);
    }
  }

  /**
   * Check if SMS service is configured
   */
  static isConfigured(): boolean {
    return twilioClient !== null;
  }
}

/**
 * Generic SMS sending function (for OTP and other use cases)
 */
export async function sendSMS(phone: string, message: string): Promise<{ success: boolean; messageId?: string }> {
  // Format phone number for India (ensure +91 prefix)
  let formattedPhone = phone.trim();
  if (!formattedPhone.startsWith('+')) {
    formattedPhone = formattedPhone.startsWith('91')
      ? `+${formattedPhone}`
      : `+91${formattedPhone.replace(/^0+/, '')}`;
  }

  try {
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      const response = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone,
      });

      console.log(`✅ SMS sent to ${formattedPhone}. SID: ${response.sid}`);
      return { success: true, messageId: response.sid };
    } else {
      // Development mode - just log
      console.log('📱 SMS (DEV MODE - not actually sent):', {
        to: formattedPhone,
        message: message.substring(0, 100) + '...',
      });
      return { success: true, messageId: 'dev-mode' };
    }
  } catch (error) {
    console.error('❌ Failed to send SMS:', error);
    throw error;
  }
}
