import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production-min-32-chars';
const JWT_EXPIRES_IN = '7d';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    // Validate input
    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Check if OTP exists in database
    const storedOTP = await prisma.otp.findUnique({
      where: { phone },
    });
    
    if (!storedOTP) {
      return NextResponse.json(
        { error: 'OTP not found or expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (storedOTP.expiresAt < new Date()) {
      await prisma.otp.delete({ where: { phone } });
      return NextResponse.json(
        { error: 'OTP expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedOTP.otp !== otp.trim()) {
      return NextResponse.json(
        { error: 'Invalid OTP. Please check and try again.' },
        { status: 400 }
      );
    }

    // OTP verified successfully - delete it from database
    await prisma.otp.delete({ where: { phone } });

    // Check if this is an existing user (lookup in database)
    let existingUserData = null;
    try {
      // Find the most recent booking with this phone number
      const recentBooking = await prisma.booking.findFirst({
        where: {
          user: {
            phone: phone,
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
        // Parse patient info from the booking
        const patientInfo = JSON.parse(recentBooking.patientInfo);
        
        existingUserData = {
          name: patientInfo.name || recentBooking.user.name,
          email: patientInfo.email || recentBooking.user.email,
          phone: phone,
          dateOfBirth: patientInfo.dateOfBirth || recentBooking.user.dateOfBirth?.toISOString().split('T')[0],
          isExistingUser: true,
        };

        console.log(`👤 Existing user found: ${existingUserData.name}`);
      } else {
        console.log(`🆕 New user: ${phone}`);
      }
    } catch (dbError) {
      console.error('Database lookup error:', dbError);
      // Continue without user data if DB fails
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        phone,
        authMethod: 'otp',
        verified: true,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log(`✅ OTP verified for ${phone}`);

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: existingUserData || {
        phone,
        authMethod: 'otp',
        isExistingUser: false,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
