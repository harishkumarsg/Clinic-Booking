/**
 * Practo Slot Sync API
 * Manually trigger slot synchronization from Practo
 * URL: /api/practo/sync
 */

import { NextRequest, NextResponse } from 'next/server';
import { practoService } from '@/lib/services/practo';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { doctorId, startDate } = await request.json();

    if (!doctorId) {
      return NextResponse.json(
        { error: 'doctorId is required' },
        { status: 400 }
      );
    }

    // Find doctor by ID
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    if (!doctor.practoId) {
      return NextResponse.json(
        { error: 'Doctor does not have a Practo ID' },
        { status: 400 }
      );
    }

    // Sync slots
    const syncDate = startDate ? new Date(startDate) : new Date();
    const result = await practoService.syncSlots(doctor.practoId, syncDate);

    return NextResponse.json({
      success: true,
      doctor: doctor.name,
      syncDate: syncDate.toISOString(),
      result,
    });
  } catch (error) {
    console.error('❌ Practo sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET: Sync all doctors
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7');

    // Find all doctors with Practo IDs
    const doctors = await prisma.doctor.findMany({
      where: {
        practoId: { not: null },
        active: true,
      },
    });

    if (doctors.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No doctors with Practo integration found',
        results: [],
      });
    }

    const results = [];
    const syncDate = new Date();

    for (const doctor of doctors) {
      if (doctor.practoId) {
        const result = await practoService.syncSlots(doctor.practoId, syncDate);
        results.push({
          doctor: doctor.name,
          practoId: doctor.practoId,
          ...result,
        });

        // Wait a bit between syncs to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      success: true,
      syncedDoctors: results.length,
      results,
    });
  } catch (error) {
    console.error('❌ Batch sync error:', error);
    return NextResponse.json(
      { error: 'Batch sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
