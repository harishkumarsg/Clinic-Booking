/**
 * Twilio WhatsApp Service for Dr. Sindhu's Clinic
 */

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.warn('⚠️ Twilio credentials not configured. WhatsApp messaging will not work.');
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export class TwilioWhatsAppService {
  /**
   * Send a text message via WhatsApp
   */
  static async sendMessage(to: string, message: string): Promise<string | null> {
    if (!client) {
      console.error('Twilio client not initialized');
      return null;
    }

    try {
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const formattedFrom = twilioPhoneNumber!.startsWith('whatsapp:') 
        ? twilioPhoneNumber! 
        : `whatsapp:${twilioPhoneNumber!}`;

      const result = await client.messages.create({
        body: message,
        from: formattedFrom,
        to: formattedTo,
      });

      console.log(`✅ WhatsApp message sent: ${result.sid}`);
      return result.sid;
    } catch (error) {
      console.error('❌ Failed to send WhatsApp message:', error);
      return null;
    }
  }

  /**
   * Send a message with media (image, document, etc.)
   */
  static async sendMediaMessage(
    to: string,
    message: string,
    mediaUrl: string
  ): Promise<string | null> {
    if (!client) {
      console.error('Twilio client not initialized');
      return null;
    }

    try {
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const formattedFrom = twilioPhoneNumber!.startsWith('whatsapp:') 
        ? twilioPhoneNumber! 
        : `whatsapp:${twilioPhoneNumber!}`;

      const result = await client.messages.create({
        body: message,
        from: formattedFrom,
        to: formattedTo,
        mediaUrl: [mediaUrl],
      });

      console.log(`✅ WhatsApp media message sent: ${result.sid}`);
      return result.sid;
    } catch (error) {
      console.error('❌ Failed to send WhatsApp media message:', error);
      return null;
    }
  }

  /**
   * Send WhatsApp link from IVR
   */
  static async sendWhatsAppLink(to: string, fromIVR: boolean = false): Promise<boolean> {
    const message = fromIVR
      ? `Hello! 👋\n\nWe've sent you a WhatsApp link to continue your booking with Dr. Sindhu's Skin Clinic.\n\nPlease reply with "Hi" to start the appointment booking process.`
      : `Welcome to Dr. Sindhu's Skin Clinic! 🏥\n\nI'm here to help you book appointments, order medicines, or connect with our staff.\n\nReply with "Hi" to get started!`;

    const sid = await this.sendMessage(to, message);
    return sid !== null;
  }

  /**
   * Send appointment confirmation
   */
  static async sendAppointmentConfirmation(
    to: string,
    patientName: string,
    doctorName: string,
    date: string,
    time: string,
    service: string
  ): Promise<boolean> {
    const message = `✅ *Booking Confirmed!*\n\n` +
      `Hello ${patientName},\n\n` +
      `Your appointment has been successfully booked:\n\n` +
      `👨‍⚕️ Doctor: ${doctorName}\n` +
      `📅 Date: ${date}\n` +
      `⏰ Time: ${time}\n` +
      `💉 Service: ${service}\n\n` +
      `📍 Location: Velachery Main Road, Chennai\n\n` +
      `Please arrive 10 minutes early.\n` +
      `Free cancellation up to 24 hours before.\n\n` +
      `See you soon! 😊`;

    const sid = await this.sendMessage(to, message);
    return sid !== null;
  }

  /**
   * Send payment link
   */
  static async sendPaymentLink(
    to: string,
    amount: number,
    paymentUrl: string
  ): Promise<boolean> {
    const message = `💳 *Payment Required*\n\n` +
      `Please complete your payment of ₹${amount}\n\n` +
      `Click here to pay: ${paymentUrl}\n\n` +
      `Your slot is temporarily reserved and will be released if payment is not completed within 1 hour.`;

    const sid = await this.sendMessage(to, message);
    return sid !== null;
  }

  /**
   * Send reminder for inactive conversation
   */
  static async sendReminderMessage(to: string): Promise<boolean> {
    const message = `👋 Are you still there?\n\n` +
      `Your booking session will expire soon.\n\n` +
      `Reply with "Continue" to resume, or "Cancel" to start over.`;

    const sid = await this.sendMessage(to, message);
    return sid !== null;
  }
}
