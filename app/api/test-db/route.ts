import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Check if Otp table exists
    const otpCount = await prisma.otp.count();
    
    return NextResponse.json({
      success: true,
      message: 'Database connected',
      connection: result,
      otpTableExists: true,
      otpCount,
      databaseUrl: process.env.DATABASE_URL?.substring(0, 30) + '...',
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
}
