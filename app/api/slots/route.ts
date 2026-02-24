/**
 * Get Available Slots API
 * GET /api/slots?date=2026-02-25&serviceId=service-001
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateMockSlots } from '@/lib/data/mockData';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');
    
    if (!dateStr) {
      return NextResponse.json(
        { error: 'Date parameter required' },
        { status: 400 }
      );
    }
    
    const date = new Date(dateStr);
    const slots = generateMockSlots(date);
    
    return NextResponse.json({
      success: true,
      date: dateStr,
      serviceId: serviceId || null,
      slots,
      totalSlots: slots.length,
      availableSlots: slots.filter(s => s.available).length,
      syncedAt: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Slots API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}
