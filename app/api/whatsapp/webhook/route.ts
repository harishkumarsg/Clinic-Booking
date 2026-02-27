/**
 * WhatsApp Webhook - Receives incoming messages from Twilio
 * URL: /api/whatsapp/webhook
 */

import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppMessageHandler } from '@/lib/whatsapp/messageHandler';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract Twilio webhook data
    const from = formData.get('From') as string; // e.g., "whatsapp:+919876543210"
    const body = formData.get('Body') as string;
    const numMedia = parseInt(formData.get('NumMedia') as string) || 0;
    const messageId = formData.get('MessageSid') as string;

    // Get media URL if present
    let mediaUrl: string | undefined;
    if (numMedia > 0) {
      mediaUrl = formData.get('MediaUrl0') as string;
    }

    if (!from || !body) {
      console.error('❌ Missing required fields:', { from, body });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`📱 WhatsApp message received from ${from}: ${body}`);

    // Process the message and wait for completion
    try {
      await WhatsAppMessageHandler.processMessage(from, body, mediaUrl);
      console.log('✅ Message processed successfully');
    } catch (error) {
      console.error('❌ Error processing WhatsApp message:', error);
      // Log detailed error for debugging
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    }

    // Respond to Twilio immediately
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  } catch (error) {
    console.error('❌ WhatsApp webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Allow Twilio to POST without CSRF validation
export const dynamic = 'force-dynamic';
