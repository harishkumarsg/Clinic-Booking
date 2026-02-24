import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Look up most recent booking for this email
    const recentBooking = await prisma.booking.findFirst({
      where: {
        user: {
          email: email,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: true,
      },
    });

    if (recentBooking) {
      // Parse patient info from booking
      const patientInfo = JSON.parse(recentBooking.patientInfo);
      
      console.log(`👤 Found existing user by email: ${email}`);
      
      // Format phone number (ensure it has +91 prefix)
      let phone = recentBooking.user.phone || patientInfo.phone || '';
      if (phone && !phone.startsWith('+91')) {
        phone = `+91${phone}`;
      }
      
      // Format date of birth to YYYY-MM-DD for date input
      let dateOfBirth = recentBooking.user.dateOfBirth || patientInfo.dateOfBirth || '';
      if (dateOfBirth && typeof dateOfBirth !== 'string') {
        dateOfBirth = new Date(dateOfBirth).toISOString().split('T')[0];
      } else if (dateOfBirth && dateOfBirth.includes('T')) {
        dateOfBirth = dateOfBirth.split('T')[0];
      }
      
      return NextResponse.json({
        success: true,
        user: {
          name: patientInfo.name || recentBooking.user.name,
          email: recentBooking.user.email,
          phone: phone,
          dateOfBirth: dateOfBirth,
          isExistingUser: true,
        },
      });
    }

    console.log(`🆕 No previous bookings found for email: ${email}`);
    
    return NextResponse.json({
      success: true,
      user: {
        email: email,
        isExistingUser: false,
      },
    });
  } catch (error) {
    console.error('User lookup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
