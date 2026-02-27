/**
 * Practo API Service for Dr. Sindhu's Skin Clinic
 * Handles two-way calendar sync with Practo platform
 */

import { prisma } from '@/lib/prisma';

const PRACTO_API_URL = process.env.PRACTO_API_URL || 'https://api.practo.com/v1';
const PRACTO_API_KEY = process.env.PRACTO_API_KEY;
const PRACTO_API_SECRET = process.env.PRACTO_API_SECRET;
const PRACTO_CLINIC_ID = process.env.PRACTO_CLINIC_ID;

if (!PRACTO_API_KEY || !PRACTO_API_SECRET || !PRACTO_CLINIC_ID) {
  console.warn('⚠️ Practo API credentials not configured. Calendar sync will not work.');
}

interface PractoSlot {
  id: string;
  doctor_id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  available: boolean;
}

interface PractoBooking {
  id: string;
  slot_id: string;
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  service_type: string;
  status: string; // confirmed/cancelled/completed
  created_at: string;
}

export class PractoService {
  /**
   * Fetch available slots from Practo for a specific date range
   */
  static async fetchSlots(startDate: Date, endDate: Date): Promise<PractoSlot[]> {
    if (!PRACTO_API_KEY) {
      console.error('Practo API key not configured');
      return [];
    }

    try {
      const response = await fetch(
        `${PRACTO_API_URL}/clinics/${PRACTO_CLINIC_ID}/slots?start_date=${this.formatDate(startDate)}&end_date=${this.formatDate(endDate)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${PRACTO_API_KEY}`,
            'X-API-Secret': PRACTO_API_SECRET!,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Practo API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Fetched ${data.slots?.length || 0} slots from Practo`);
      return data.slots || [];
    } catch (error) {
      console.error('❌ Error fetching Practo slots:', error);
      return [];
    }
  }

  /**
   * Sync Practo slots to local database
   */
  static async syncSlotsFromPracto(startDate: Date, endDate: Date): Promise<number> {
    const startTime = Date.now();
    
    try {
      // Fetch slots from Practo
      const practoSlots = await this.fetchSlots(startDate, endDate);
      
      let synced = 0;
      let available = 0;

      for (const practoSlot of practoSlots) {
        // Find or create doctor by Practo ID
        let doctor = await prisma.doctor.findUnique({
          where: { practoId: practoSlot.doctor_id },
        });

        if (!doctor) {
          console.warn(`⚠️ Doctor with Practo ID ${practoSlot.doctor_id} not found in database`);
          continue;
        }

        // Create or update slot
        const slotDate = new Date(practoSlot.date);
        
        await prisma.slot.upsert({
          where: {
            doctorId_date_time: {
              doctorId: doctor.id,
              date: slotDate,
              time: practoSlot.time,
            },
          },
          update: {
            available: practoSlot.available,
            source: 'practo',
          },
          create: {
            doctorId: doctor.id,
            date: slotDate,
            time: practoSlot.time,
            period: this.getPeriodFromTime(practoSlot.time),
            available: practoSlot.available,
            source: 'practo',
          },
        });

        synced++;
        if (practoSlot.available) available++;
      }

      // Log sync operation
      const duration = Date.now() - startTime;
      await prisma.slotSyncLog.create({
        data: {
          date: new Date(),
          source: 'practo',
          syncedAt: new Date(),
          slotsTotal: synced,
          slotsAvail: available,
          duration,
        },
      });

      console.log(`✅ Synced ${synced} slots from Practo (${available} available) in ${duration}ms`);
      return synced;
    } catch (error) {
      console.error('❌ Error syncing slots from Practo:', error);
      return 0;
    }
  }

  /**
   * Push a booking to Practo (when booked via website/WhatsApp)
   */
  static async pushBookingToPracto(bookingId: string): Promise<boolean> {
    if (!PRACTO_API_KEY) {
      console.error('Practo API key not configured');
      return false;
    }

    try {
      // Get booking details from database
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          slot: {
            include: {
              doctor: true,
            },
          },
          service: true,
        },
      });

      if (!booking) {
        throw new Error(`Booking ${bookingId} not found`);
      }

      if (!booking.slot.doctor.practoId) {
        console.warn(`⚠️ Doctor ${booking.slot.doctor.name} does not have a Practo ID`);
        return false;
      }

      // Parse patient info
      const patientInfo = JSON.parse(booking.patientInfo);

      // Send booking to Practo
      const response = await fetch(
        `${PRACTO_API_URL}/clinics/${PRACTO_CLINIC_ID}/bookings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PRACTO_API_KEY}`,
            'X-API-Secret': PRACTO_API_SECRET!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            doctor_id: booking.slot.doctor.practoId,
            date: this.formatDate(booking.slot.date),
            time: booking.slot.time,
            patient_name: patientInfo.name || booking.user.name,
            patient_phone: patientInfo.phone || booking.user.phone,
            patient_email: booking.user.email,
            service_type: booking.service.name,
            notes: patientInfo.notes || '',
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Practo API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const practoBookingId = data.booking_id;

      // Create sync record
      await prisma.practoSync.create({
        data: {
          bookingId: booking.id,
          practoBookingId: practoBookingId,
          status: 'synced',
          lastSyncedAt: new Date(),
        },
      });

      console.log(`✅ Booking ${bookingId} synced to Practo as ${practoBookingId}`);
      return true;
    } catch (error) {
      console.error('❌ Error pushing booking to Practo:', error);

      // Log failed sync attempt
      try {
        await prisma.practoSync.upsert({
          where: { bookingId },
          update: {
            status: 'failed',
            retryCount: { increment: 1 },
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          create: {
            bookingId,
            practoBookingId: 'pending',
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      } catch (dbError) {
        console.error('Failed to log sync error:', dbError);
      }

      return false;
    }
  }

  /**
   * Handle booking cancellation from Practo
   */
  static async handlePractoCancellation(practoBookingId: string): Promise<boolean> {
    try {
      // Find the sync record
      const sync = await prisma.practoSync.findUnique({
        where: { practoBookingId },
        include: { booking: true },
      });

      if (!sync) {
        console.warn(`⚠️ No booking found for Practo ID ${practoBookingId}`);
        return false;
      }

      // Update booking status
      await prisma.booking.update({
        where: { id: sync.bookingId },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      });

      // Mark slot as available
      await prisma.slot.update({
        where: { id: sync.booking.slotId },
        data: {
          available: true,
          bookedBy: null,
        },
      });

      console.log(`✅ Cancelled booking ${sync.bookingId} (Practo ID: ${practoBookingId})`);
      return true;
    } catch (error) {
      console.error('❌ Error handling Practo cancellation:', error);
      return false;
    }
  }

  /**
   * Retry failed syncs
   */
  static async retryFailedSyncs(): Promise<number> {
    try {
      const failedSyncs = await prisma.practoSync.findMany({
        where: {
          status: 'failed',
          retryCount: { lt: 3 }, // Max 3 retries
        },
      });

      let retried = 0;
      for (const sync of failedSyncs) {
        const success = await this.pushBookingToPracto(sync.bookingId);
        if (success) retried++;
      }

      console.log(`✅ Retried ${retried} failed syncs`);
      return retried;
    } catch (error) {
      console.error('❌ Error retrying failed syncs:', error);
      return 0;
    }
  }

  // Helper methods
  private static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private static getPeriodFromTime(time: string): string {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }
}
