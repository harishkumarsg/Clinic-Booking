/**
 * Get Booking API
 * GET /api/bookings/[id]
 */

import { NextRequest, NextResponse } from 'next/server';

// Using the same in-memory storage as create
// In production, this would query the database
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    
    // Mock response for demonstration
    const booking = {
      id: bookingId,
      doctor: {
        name: 'Dr. Sindhu Ragavi',
        title: 'Consultant Dermatologist',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      },
      service: {
        name: 'Acne Treatment',
        duration: 45,
        price: 500,
      },
      slot: {
        date: new Date().toISOString(),
        time: '10:00',
      },
      patientInfo: {
        name: 'Patient Name',
        phone: '+919876543210',
        email: 'patient@example.com',
      },
      status: 'confirmed',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...',
      createdAt: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      booking,
    });
    
  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}
