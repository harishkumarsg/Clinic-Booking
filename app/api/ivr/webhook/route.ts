/**
 * IVR (Interactive Voice Response) Webhook
 * Handles incoming voice calls from Twilio
 * URL: /api/ivr/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { TwilioWhatsAppService } from '@/lib/whatsapp/twilioService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const from = formData.get('From') as string; // Caller's phone number
    const digits = formData.get('Digits') as string; // DTMF input from caller

    console.log(`📞 IVR call from ${from}, pressed: ${digits}`);

    // TwiML response for voice call
    let twiml = `<?xml version="1.0" encoding="UTF-8"?>`;
    twiml += `<Response>`;

    if (!digits) {
      // Initial greeting and menu
      twiml += `<Gather action="/api/ivr/webhook" method="POST" numDigits="1" timeout="10">`;
      twiml += `<Say voice="Polly.Aditi" language="en-IN">`;
      twiml += `Welcome to Doctor Sindhu's Skin Clinic. `;
      twiml += `Press 1 for Appointment Booking. `;
      twiml += `Press 2 for Pharmacy Order. `;
      twiml += `Press 3 to Talk to Our Staff. `;
      twiml += `Press 4 to Return to Main Menu.`;
      twiml += `</Say>`;
      twiml += `</Gather>`;
    } else {
      // Handle menu selection
      switch (digits) {
        case '1': // Appointment Booking
        case '2': // Pharmacy Order
          twiml += `<Say voice="Polly.Aditi" language="en-IN">`;
          twiml += `We have sent you a WhatsApp link to continue. `;
          twiml += `Please check your WhatsApp messages. Thank you for calling.`;
          twiml += `</Say>`;
          twiml += `<Hangup/>`;

          // Send WhatsApp message
          setTimeout(async () => {
            await TwilioWhatsAppService.sendWhatsAppLink(from, true);
          }, 1000);
          break;

        case '3': // Talk to Staff
          twiml += `<Say voice="Polly.Aditi" language="en-IN">`;
          twiml += `Please hold while we connect you to our staff.`;
          twiml += `</Say>`;
          twiml += `<Dial timeout="30" record="record-from-ringing">`;
          twiml += `+919876543210`; // Replace with actual staff number
          twiml += `</Dial>`;
          twiml += `<Say voice="Polly.Aditi" language="en-IN">`;
          twiml += `Sorry, our staff is currently unavailable. Please try again later.`;
          twiml += `</Say>`;
          twiml += `<Hangup/>`;
          break;

        case '4': // Return to Main Menu
          twiml += `<Redirect method="POST">/api/ivr/webhook</Redirect>`;
          break;

        default:
          twiml += `<Say voice="Polly.Aditi" language="en-IN">`;
          twiml += `Invalid option. Please try again.`;
          twiml += `</Say>`;
          twiml += `<Redirect method="POST">/api/ivr/webhook</Redirect>`;
      }
    }

    twiml += `</Response>`;

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('❌ IVR webhook error:', error);

    // Fallback TwiML
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say voice="Polly.Aditi" language="en-IN">
          Sorry, we are experiencing technical difficulties. Please try again later.
        </Say>
        <Hangup/>
      </Response>`;

    return new NextResponse(errorTwiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  }
}

export const dynamic = 'force-dynamic';
