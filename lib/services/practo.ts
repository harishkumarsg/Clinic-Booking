// Practo Integration Service
// Handles slot synchronization, booking sync, and webhook processing

import axios, { AxiosInstance } from 'axios';

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

    try {
      const startDate = date;
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 7); // Sync next 7 days

      const practoSlots = await this.fetchSlots(doctorId, startDate, endDate);

      let synced = 0;
      let conflicts = 0;
      let errors = 0;

      // TODO: Implement actual sync logic with database
      // For each Practo slot:
      // 1. Check if local slot exists
      // 2. If exists and booked on both: mark conflict
      // 3. If exists on Practo only: create local slot
      // 4. If booked on Practo: mark slot as unavailable locally

      console.log(`✅ Slot sync complete: ${synced} synced, ${conflicts} conflicts`);
      return { synced, conflicts, errors };
    } catch (error) {
      console.error('❌ Slot sync failed:', error);
      return { synced: 0, conflicts: 0, errors: 1 };
    }
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

    // TODO: Implement signature verification
    // const isValid = verifyWebhookSignature(payload, signature, webhookSecret);
    // if (!isValid) {
    //   return { success: false };
    // }

    const { event, data } = payload;

    console.log(`📥 Practo webhook received: ${event}`, data);

    switch (event) {
      case 'booking.created':
        // A booking was made on Practo - update local database
        console.log('✅ Booking created on Practo:', data.booking_id);
        // TODO: Mark slot as booked locally
        return { success: true, action: 'booking_created' };

      case 'booking.cancelled':
        // A booking was cancelled on Practo - free up local slot
        console.log('❌ Booking cancelled on Practo:', data.booking_id);
        // TODO: Mark slot as available locally
        return { success: true, action: 'booking_cancelled' };

      case 'slot.blocked':
        // Doctor blocked a slot on Practo - mark unavailable locally
        console.log('🚫 Slot blocked on Practo:', data.slot_id);
        // TODO: Mark slot as unavailable
        return { success: true, action: 'slot_blocked' };

      case 'slot.unblocked':
        // Doctor unblocked a slot on Practo - mark available locally
        console.log('✅ Slot unblocked on Practo:', data.slot_id);
        // TODO: Mark slot as available
        return { success: true, action: 'slot_unblocked' };

      default:
        console.log('⚠️  Unknown Practo webhook event:', event);
        return { success: true };
    }
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
