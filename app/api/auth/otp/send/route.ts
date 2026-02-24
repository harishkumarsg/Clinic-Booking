import { NextRequest, NextResponse } from 'next/server';
import { sendSMS } from '@/lib/services/sms';
import { prisma } from '@/lib/prisma';

// Generate random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    // Validate phone number
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate Indian phone number format
    const phoneRegex = /^\+91\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use +91XXXXXXXXXX' },
        { status: 400 }
      );
    }

    // Check rate limiting (max 3 OTPs per phone per 10 minutes)
    const existingOTP = await prisma.otp.findUnique({
      where: { phone },
    });
    
    if (existingOTP && existingOTP.attempts >= 3 && existingOTP.expiresAt > new Date()) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database (upsert = update if exists, create if not)
    await prisma.otp.upsert({
      where: { phone },
      update: {
        otp,
        expiresAt,
        attempts: existingOTP ? existingOTP.attempts + 1 : 1,
      },
      create: {
        phone,
        otp,
        expiresAt,
        attempts: 1,
      },
    });

    // Send OTP via SMS
    const message = `Your OTP for Dr. Sindhu's Skin Clinic appointment booking is: ${otp}. Valid for 10 minutes. Do not share this code.`;
    
    try {
      const smsResult = await sendSMS(phone, message);
      
      console.log(`📱 OTP sent to ${phone}: ${otp} (DEV: showing OTP in logs)`);

      return NextResponse.json({
        success: true,
        message: 'OTP sent successfully',
        expiresIn: 600, // 10 minutes in seconds
        // Include OTP in development mode for testing
        ...(process.env.NODE_ENV === 'development' && { otp }),
      });
    } catch (smsError) {
      console.error('SMS sending failed:', smsError);
      
      // In development, still return success with OTP
      if (process.env.NODE_ENV === 'development') {
        console.log(`📱 DEV MODE: OTP for ${phone} is ${otp}`);
        return NextResponse.json({
          success: true,
          message: 'OTP generated (SMS failed but showing in logs)',
          otp, // Show OTP in dev mode
          expiresIn: 600,
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('OTP send error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
