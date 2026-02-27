/**
 * Send WhatsApp Message API
 * Used for testing and for IVR to trigger WhatsApp flow
 * URL: /api/whatsapp/send
 */

import { NextRequest, NextResponse } from 'next/server';
import { TwilioWhatsAppService } from '@/lib/whatsapp/twilioService';

export async function POST(request: NextRequest) {
  try {
    const { to, fromIVR } = await request.json();

    if (!to) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Send WhatsApp link/greeting
    const success = await TwilioWhatsAppService.sendWhatsAppLink(to, fromIVR || false);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'WhatsApp message sent successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send WhatsApp message' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error sending WhatsApp message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
