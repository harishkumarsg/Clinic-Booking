// Practo Integration Service
// Handles slot synchronization, booking sync, and webhook processing

import axios, { AxiosInstance } from 'axios';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

interface PractoConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  clinicId: string;
}

interface PractoSlot {
  id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'blocked';
  source: 'practo' | 'website';
}

interface PractoBooking {
  id: string;
  slotId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  source: 'practo' | 'website';
}

export class PractoService {
  private client: AxiosInstance | null = null;
  private config: PractoConfig | null = null;
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!(
      process.env.PRACTO_API_KEY &&
      process.env.PRACTO_API_SECRET &&
      process.env.PRACTO_CLINIC_ID
    );

    if (this.isConfigured) {
      this.config = {
        apiKey: process.env.PRACTO_API_KEY!,
        apiSecret: process.env.PRACTO_API_SECRET!,
        baseUrl: process.env.PRACTO_API_URL || 'https://api.practo.com/v1',
        clinicId: process.env.PRACTO_CLINIC_ID!,
      };

      this.client = axios.create({
        baseURL: this.config.baseUrl,
        headers: {
          'X-API-Key': this.config.apiKey,
          'X-API-Secret': this.config.apiSecret,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
    } else {
      console.log('⚠️  Practo integration not configured (dev mode)');
    }
  }

  /**
   * Fetch slots from Practo for a specific date range
   */
  async fetchSlots(doctorId: string, startDate: Date, endDate: Date): Promise<PractoSlot[]> {
    if (!this.isConfigured || !this.client || !this.config) {
      console.log('📅 PRACTO FETCH SLOTS (DEV MODE):', { doctorId, startDate, endDate });
      return [];
    }

    try {
      const response = await this.client.get('/slots', {
        params: {
          doctor_id: doctorId,
          clinic_id: this.config.clinicId,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
        },
      });

      console.log(`✅ Fetched ${response.data.slots?.length || 0} slots from Practo`);
      return response.data.slots || [];
    } catch (error) {
      console.error('❌ Failed to fetch Practo slots:', error);
      return [];
    }
  }

  /**
   * Push a booking to Practo (when user books on website)
   */
  async pushBooking(booking: PractoBooking): Promise<{ success: boolean; practoBookingId?: string }> {
    if (!this.isConfigured || !this.client || !this.config) {
      console.log('📤 PRACTO PUSH BOOKING (DEV MODE):', booking);
      return { success: true, practoBookingId: `PRACTO-DEV-${Date.now()}` };
    }

    try {
      const response = await this.client.post('/bookings', {
        clinic_id: this.config.clinicId,
        slot_id: booking.slotId,
        patient: {
          name: booking.patientName,
          phone: booking.patientPhone,
          email: booking.patientEmail,
        },
        source: 'website',
        external_booking_id: booking.id,
      });

      console.log(`✅ Booking pushed to Practo: ${response.data.booking_id}`);
      return { success: true, practoBookingId: response.data.booking_id };
    } catch (error) {
      console.error('❌ Failed to push booking to Practo:', error);
      return { success: false };
    }
  }

  /**
   * Cancel a booking on Practo
   */
  async cancelBooking(practoBookingId: string): Promise<boolean> {
    if (!this.isConfigured || !this.client || !this.config) {
      console.log('❌ PRACTO CANCEL BOOKING (DEV MODE):', practoBookingId);
      return true;
    }

    try {
      await this.client.post(`/bookings/${practoBookingId}/cancel`, {
        clinic_id: this.config.clinicId,
      });

      console.log(`✅ Booking cancelled on Practo: ${practoBookingId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to cancel Practo booking:', error);
      return false;
    }
  }

  /**
   * Sync slots: Merge Practo slots with local slots
   * Strategy: Practo slots take priority, mark conflicts
   */
  async syncSlots(doctorId: string, date: Date): Promise<{
    synced: number;
    conflicts: number;
    errors: number;
  }> {
    if (!this.isConfigured || !this.client || !this.config) {
      console.log('🔄 PRACTO SYNC SLOTS (DEV MODE):', { doctorId, date });
      return { synced: 0, conflicts: 0, errors: 0 };
    }

    const startTime = Date.now();

    try {
      const startDate = date;
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 7); // Sync next 7 days

      const practoSlots = await this.fetchSlots(doctorId, startDate, endDate);

      let synced = 0;
      let conflicts = 0;
      let errors = 0;
      let available = 0;

      // Find the local doctor by Practo ID
      const doctor = await prisma.doctor.findUnique({
        where: { practoId: doctorId },
      });

      if (!doctor) {
        console.error(`❌ Doctor not found for Practo ID: ${doctorId}`);
        return { synced: 0, conflicts: 0, errors: 1 };
      }

      // Process each Practo slot
      for (const practoSlot of practoSlots) {
        try {
          const slotDate = new Date(practoSlot.date);
          const slotTime = practoSlot.startTime;
          const isAvailable = practoSlot.status === 'available';

          // Check if local slot exists
          const existingSlot = await prisma.slot.findUnique({
            where: {
              doctorId_date_time: {
                doctorId: doctor.id,
                date: slotDate,
                time: slotTime,
              },
            },
          });

          if (existingSlot) {
            // Slot exists locally - check for conflicts
            if (!existingSlot.available && isAvailable && existingSlot.source === 'website') {
              // Conflict: booked on website but available on Practo
              console.warn(`⚠️ Conflict detected: Slot ${slotDate} ${slotTime} booked locally but available on Practo`);
              conflicts++;
              // Keep website booking, don't override
              continue;
            }

            // Update existing slot
            await prisma.slot.update({
              where: { id: existingSlot.id },
              data: {
                available: isAvailable,
                source: 'practo',
              },
            });
          } else {
            // Create new slot from Practo
            await prisma.slot.create({
              data: {
                doctorId: doctor.id,
                date: slotDate,
                time: slotTime,
                period: this.getPeriodFromTime(slotTime),
                available: isAvailable,
                source: 'practo',
              },
            });
          }

          synced++;
          if (isAvailable) available++;
        } catch (error) {
          console.error(`❌ Error syncing slot:`, error);
          errors++;
        }
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

      console.log(`✅ Slot sync complete: ${synced} synced, ${available} available, ${conflicts} conflicts, ${errors} errors in ${duration}ms`);
      return { synced, conflicts, errors };
    } catch (error) {
      console.error('❌ Slot sync failed:', error);
      return { synced: 0, conflicts: 0, errors: 1 };
    }
  }

  /**
   * Helper: Get period from time
   */
  private getPeriodFromTime(time: string): string {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  /**
   * Process webhook from Practo (booking/cancellation)
   */
  static async processWebhook(payload: any, signature: string): Promise<{
    success: boolean;
    action?: string;
  }> {
    // Verify webhook signature
    const webhookSecret = process.env.PRACTO_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.log('⚠️  Practo webhook secret not configured');
      return { success: false };
    }

    // Verify signature
    const isValid = this.verifyWebhookSignature(JSON.stringify(payload), signature, webhookSecret);
    if (!isValid) {
      console.error('❌ Invalid Practo webhook signature');
      return { success: false };
    }

    const { event, data } = payload;

    console.log(`📥 Practo webhook received: ${event}`, data);

    try {
      switch (event) {
        case 'booking.created':
          // A booking was made on Practo - update local database
          await this.handleBookingCreated(data);
          return { success: true, action: 'booking_created' };

        case 'booking.cancelled':
          // A booking was cancelled on Practo - free up local slot
          await this.handleBookingCancelled(data);
          return { success: true, action: 'booking_cancelled' };

        case 'slot.blocked':
          // Doctor blocked a slot on Practo - mark unavailable locally
          await this.handleSlotBlocked(data);
          return { success: true, action: 'slot_blocked' };

        case 'slot.unblocked':
          // Doctor unblocked a slot on Practo - mark available locally
          await this.handleSlotUnblocked(data);
          return { success: true, action: 'slot_unblocked' };

        default:
          console.log('⚠️  Unknown Practo webhook event:', event);
          return { success: true };
      }
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      return { success: false };
    }
  }

  /**
   * Verify webhook signature using HMAC SHA256
   */
  private static verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Handle booking created on Practo
   */
  private static async handleBookingCreated(data: any) {
    const { booking_id, doctor_id, slot_id, date, time, patient } = data;

    // Find doctor
    const doctor = await prisma.doctor.findUnique({
      where: { practoId: doctor_id },
    });

    if (!doctor) {
      console.error(`❌ Doctor not found for Practo ID: ${doctor_id}`);
      return;
    }

    // Find or create slot
    const slotDate = new Date(date);
    let slot = await prisma.slot.findUnique({
      where: {
        doctorId_date_time: {
          doctorId: doctor.id,
          date: slotDate,
          time,
        },
      },
    });

    if (!slot) {
      slot = await prisma.slot.create({
        data: {
          doctorId: doctor.id,
          date: slotDate,
          time,
          period: this.getPeriodFromTime(time),
          available: false,
          source: 'practo',
          bookedBy: patient.phone,
        },
      });
    } else {
      await prisma.slot.update({
        where: { id: slot.id },
        data: {
          available: false,
          bookedBy: patient.phone,
          source: 'practo',
        },
      });
    }

    console.log(`✅ Practo booking ${booking_id} synced to local slot ${slot.id}`);
  }

  /**
   * Handle booking cancelled on Practo
   */
  private static async handleBookingCancelled(data: any) {
    const { booking_id } = data;

    // Find sync record
    const sync = await prisma.practoSync.findUnique({
      where: { practoBookingId: booking_id },
      include: { booking: true },
    });

    if (!sync) {
      console.warn(`⚠️ No booking found for Practo ID ${booking_id}`);
      return;
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

    console.log(`✅ Cancelled booking ${sync.bookingId} (Practo ID: ${booking_id})`);
  }

  /**
   * Handle slot blocked on Practo
   */
  private static async handleSlotBlocked(data: any) {
    const { slot_id, doctor_id, date, time } = data;

    const doctor = await prisma.doctor.findUnique({
      where: { practoId: doctor_id },
    });

    if (!doctor) {
      console.error(`❌ Doctor not found for Practo ID: ${doctor_id}`);
      return;
    }

    const slotDate = new Date(date);

    await prisma.slot.upsert({
      where: {
        doctorId_date_time: {
          doctorId: doctor.id,
          date: slotDate,
          time,
        },
      },
      update: {
        available: false,
        source: 'practo',
      },
      create: {
        doctorId: doctor.id,
        date: slotDate,
        time,
        period: this.getPeriodFromTime(time),
        available: false,
        source: 'practo',
      },
    });

    console.log(`🚫 Slot blocked: ${date} ${time}`);
  }

  /**
   * Handle slot unblocked on Practo
   */
  private static async handleSlotUnblocked(data: any) {
    const { slot_id, doctor_id, date, time } = data;

    const doctor = await prisma.doctor.findUnique({
      where: { practoId: doctor_id },
    });

    if (!doctor) {
      console.error(`❌ Doctor not found for Practo ID: ${doctor_id}`);
      return;
    }

    const slotDate = new Date(date);

    await prisma.slot.update({
      where: {
        doctorId_date_time: {
          doctorId: doctor.id,
          date: slotDate,
          time,
        },
      },
      data: {
        available: true,
      },
    });

    console.log(`✅ Slot unblocked: ${date} ${time}`);
  }

  /**
   * Helper: Get period from time (static version)
   */
  private static getPeriodFromTime(time: string): string {
    const hour = parseInt(time.split(':')[0]);
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }

  /**
   * Check if Practo integration is configured
   */
  static isConfigured(): boolean {
    return !!(
      process.env.PRACTO_API_KEY &&
      process.env.PRACTO_API_SECRET &&
      process.env.PRACTO_CLINIC_ID
    );
  }
}

// Export singleton instance
export const practoService = new PractoService();
