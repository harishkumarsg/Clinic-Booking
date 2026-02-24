/**
 * Practo Webhook Handler
 * POST /api/practo/webhook
 * 
 * Receives webhooks from Practo for:
 * - New bookings made on Practo
 * - Booking cancellations
 * - Slot blocks/unblocks
 */

import { NextRequest, NextResponse } from 'next/server';
import { PractoService } from '@/lib/services/practo';

export async function POST(req: NextRequest) {
  try {
    // Get webhook signature from headers
    const signature = req.headers.get('x-practo-signature') || '';
    
    // Parse webhook payload
    const payload = await req.json();
    
    // Process webhook
    const result = await PractoService.processWebhook(payload, signature);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      success: true,
      action: result.action,
      processed_at: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Practo webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
