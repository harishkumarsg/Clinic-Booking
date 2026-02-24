/**
 * Create Booking API
 * POST /api/bookings/create
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';
import { EmailService } from '@/lib/services/email';
import { SMSService } from '@/lib/services/sms';

// In-memory bookings storage (replace with database in production)
const bookings = new Map<string, any>();

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
    
    const { 
      reservationId, 
      patientInfo, 
      serviceId, 
      slotId, 
      date, 
      time,
      doctorInfo,
      serviceInfo,
    } = await req.json();
    
    if (!patientInfo || !serviceId || !slotId || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create booking
    const bookingId = `BOOKING-${Date.now()}`;
    
    const booking = {
      id: bookingId,
      userId: userPayload.userId,
      serviceId,
      slotId,
      date,
      time,
      patientInfo,
      status: 'confirmed',
      source: 'website',
      createdAt: new Date().toISOString(),
    };
    
    bookings.set(bookingId, booking);
    
    // Send notifications asynchronously (don't block response)
    const notificationPromises = [];
    
    // Send email notification
    if (patientInfo.email) {
      const emailData = {
        patientName: patientInfo.name,
        patientEmail: patientInfo.email,
        doctorName: doctorInfo?.name || 'Dr. Sindhu Ragavi',
        serviceName: serviceInfo?.name || 'Consultation',
        date: new Date(date).toLocaleDateString('en-IN', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        time,
        location: doctorInfo?.location || 'Velachery, Chennai',
        bookingId,
        fee: serviceInfo?.priceFrom || 500,
      };
      
      notificationPromises.push(
        EmailService.sendBookingConfirmation(emailData)
          .then(() => ({ email: 'sent' }))
          .catch((err) => {
            console.error('Email failed:', err);
            return { email: 'failed' };
          })
      );
    }
    
    // Send SMS notification
    if (patientInfo.phone) {
      const smsData = {
        phone: patientInfo.phone,
        patientName: patientInfo.name,
        doctorName: doctorInfo?.name || 'Dr. Sindhu Ragavi',
        serviceName: serviceInfo?.name || 'Consultation',
        date: new Date(date).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        }),
        time,
        location: doctorInfo?.location || 'Velachery, Chennai',
        bookingId,
      };
      
      notificationPromises.push(
        SMSService.sendBookingConfirmation(smsData)
          .then(() => ({ sms: 'sent' }))
          .catch((err) => {
            console.error('SMS failed:', err);
            return { sms: 'failed' };
          })
      );
    }
    
    // Wait for notifications to complete (with timeout)
    const notificationResults = await Promise.race([
      Promise.all(notificationPromises),
      new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 5000)), // 5s timeout
    ]);
    
    const notifications = Object.assign(
      { email: 'not_sent', sms: 'not_sent' },
      ...(notificationResults as any[])
    );
    
    return NextResponse.json({
      success: true,
      booking,
      notifications,
      practoSync: {
        status: 'pending',
        queuedAt: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
