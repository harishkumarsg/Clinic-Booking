/**
 * Google OAuth Authentication API
 * POST /api/auth/google
 */

import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { generateToken } from '@/lib/jwt';

// In-memory user storage (replace with database in production)
const users = new Map<string, any>();

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();
    
    if (!credential) {
      return NextResponse.json(
        { error: 'Credential required' },
        { status: 400 }
      );
    }
    
    // Verify Google token
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!clientId || clientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      return NextResponse.json(
        { 
          error: 'Google OAuth not configured',
          message: 'Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local'
        },
        { status: 500 }
      );
    }
    
    const client = new OAuth2Client(clientId);
    
    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 401 }
      );
    }
    
    if (!payload || !payload.sub) {
      return NextResponse.json(
        { error: 'Invalid token payload' },
        { status: 401 }
      );
    }
    
    // Find or create user
    let user = users.get(payload.sub);
    
    if (!user) {
      user = {
        id: `user_${Date.now()}`,
        googleId: payload.sub,
        email: payload.email!,
        name: payload.name!,
        photoUrl: payload.picture,
        createdAt: new Date().toISOString(),
      };
      users.set(payload.sub, user);
    }
    
    // Generate JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        photoUrl: user.photoUrl,
      },
      token,
      expiresIn: 604800, // 7 days in seconds
    });
    
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
