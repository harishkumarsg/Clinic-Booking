/**
 * Reserve Slot API
 * POST /api/slots/reserve
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

// In-memory reservations (replace with Redis in production)
const reservations = new Map<string, any>();
const reservedSlots = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    let userPayload;
    try {
      userPayload = verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    const { slotId, serviceId } = await req.json();
    
    if (!slotId || !serviceId) {
      return NextResponse.json(
        { error: 'slotId and serviceId required' },
        { status: 400 }
      );
    }
    
    // Check if slot is already reserved
    if (reservedSlots.has(slotId)) {
      return NextResponse.json(
        { error: 'Slot already reserved' },
        { status: 409 }
      );
    }
    
    // Create reservation
    const reservationId = `res_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    const reservation = {
      id: reservationId,
      slotId,
      serviceId,
      userId: userPayload.userId,
      expiresAt: expiresAt.toISOString(),
      status: 'reserved',
      createdAt: new Date().toISOString(),
    };
    
    reservations.set(reservationId, reservation);
    reservedSlots.add(slotId);
    
    // Auto-expire reservation after 15 minutes
    setTimeout(() => {
      reservations.delete(reservationId);
      reservedSlots.delete(slotId);
    }, 15 * 60 * 1000);
    
    return NextResponse.json({
      success: true,
      reservationId,
      slotId,
      expiresAt: expiresAt.toISOString(),
      expiresIn: 900, // 15 minutes in seconds
    });
    
  } catch (error) {
    console.error('Reserve slot error:', error);
    return NextResponse.json(
      { error: 'Failed to reserve slot' },
      { status: 500 }
    );
  }
}
