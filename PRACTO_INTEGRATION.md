# Practo Calendar Integration

Complete two-way calendar synchronization between Dr. Sindhu's Clinic booking system and Practo platform.

## Features

✅ **Real-time Slot Sync** - Automatically sync available slots from Practo  
✅ **Booking Push** - Push website/WhatsApp bookings to Practo  
✅ **Webhook Integration** - Receive instant updates from Practo  
✅ **Conflict Detection** - Identify and handle double-booking scenarios  
✅ **Automated Sync** - Scheduled syncs keep calendars in perfect harmony

---

## Setup

### 1. Get Practo API Credentials

1. Contact Practo Partner Support at partner-support@practo.com
2. Request API access for your clinic
3. You'll receive:
   - API Key
   - API Secret
   - Clinic ID
   - Webhook Secret

### 2. Configure Environment Variables

Add to `.env.local` and Vercel environment variables:

```env
PRACTO_API_KEY="your_api_key"
PRACTO_API_SECRET="your_api_secret"
PRACTO_CLINIC_ID="your_clinic_id"
PRACTO_WEBHOOK_SECRET="your_webhook_secret"
PRACTO_API_URL="https://api.practo.com/v1"
```

### 3. Link Doctor with Practo

In your database, update the doctor record with their Practo ID:

```sql
UPDATE "Doctor" 
SET "practoId" = 'PRACTO_DOCTOR_ID' 
WHERE name = 'Dr. Sindhu';
```

### 4. Configure Practo Webhook

In Practo Partner Dashboard:
1. Go to Webhooks Settings
2. Add webhook URL: `https://your-domain.vercel.app/api/practo/webhook`
3. Select events:
   - `booking.created`
   - `booking.cancelled`
   - `slot.blocked`
   - `slot.unblocked`
4. Save

---

## API Endpoints

### 1. Manual Slot Sync

**POST** `/api/practo/sync`

Sync slots for a specific doctor:

```bash
curl -X POST https://your-domain.vercel.app/api/practo/sync \
  -H "Content-Type: application/json" \
  -d '{"doctorId": "doctor_id", "startDate": "2026-02-27"}'
```

**GET** `/api/practo/sync`

Sync all doctors with Practo integration:

```bash
curl https://your-domain.vercel.app/api/practo/sync
```

### 2. Webhook Receiver

**POST** `/api/practo/webhook`

Automatically receives updates from Practo (configured in Practo dashboard)

---

## Usage

### Sync Slots from Practo

```typescript
import { practoService } from '@/lib/services/practo';

// Sync slots for next 7 days
const result = await practoService.syncSlots(
  'PRACTO_DOCTOR_ID',
  new Date()
);

console.log(`Synced ${result.synced} slots, ${result.conflicts} conflicts`);
```

### Push Booking to Practo

```typescript
import { practoService } from '@/lib/services/practo';

const booking = {
  id: 'booking_123',
  slotId: 'slot_456',
  patientName: 'John Doe',
  patientPhone: '+919876543210',
  patientEmail: 'john@example.com',
  status: 'confirmed',
  source: 'website',
};

const result = await practoService.pushBooking(booking);
if (result.success) {
  console.log(`Booking synced to Practo: ${result.practoBookingId}`);
}
```

### Cancel Booking on Practo

```typescript
await practoService.cancelBooking('PRACTO_BOOKING_ID');
```

---

## How It Works

### Slot Synchronization

1. **Fetch from Practo**: Get available slots for next 7 days
2. **Compare with Local**: Check existing slots in database
3. **Merge Logic**:
   - Practo slots take priority for availability
   - Website bookings are preserved (conflict detection)
   - New Practo slots are added locally
   - Unavailable Practo slots marked as blocked
4. **Log Results**: Track sync operations in `SlotSyncLog` table

### Booking Flow (Website → Practo)

```
User books via Website/WhatsApp
         ↓
Create booking in local database
         ↓
Push booking to Practo API
         ↓
Create PractoSync record
         ↓
Slot marked as booked on both sides
```

### Booking Flow (Practo → Website)

```
Patient books on Practo
         ↓
Practo sends webhook: booking.created
         ↓
Webhook handler receives event
         ↓
Mark local slot as unavailable
         ↓
Calendars synced
```

---

## Conflict Handling

**Scenario**: Slot is booked on website but appears available on Practo

**Resolution**:
1. Conflict is logged
2. Website booking takes priority (preserved)
3. Admin is notified to manually resolve
4. Practo sync is retried after resolution

---

## Database Schema

```prisma
model PractoSync {
  id              String   @id
  bookingId       String   @unique
  practoBookingId String   @unique
  status          String   // synced/pending/failed
  lastSyncedAt    DateTime
  retryCount      Int
  error           String?
}

model SlotSyncLog {
  id          String   @id
  date        DateTime
  source      String   // practo/website
  syncedAt    DateTime
  slotsTotal  Int
  slotsAvail  Int
  duration    Int      // milliseconds
}
```

---

## Testing

### 1. Test Slot Sync

```bash
# Sync slots for a specific doctor
curl -X POST http://localhost:3000/api/practo/sync \
  -H "Content-Type: application/json" \
  -d '{"doctorId": "clqxxxxx"}'

# Check database for synced slots
psql $DATABASE_URL -c "SELECT * FROM \"Slot\" WHERE source = 'practo';"
```

### 2. Test Webhook (Local Testing with ngrok)

```bash
# Start ngrok
ngrok http 3000

# Update Practo webhook URL to ngrok URL
# Example: https://abc123.ngrok.io/api/practo/webhook

# Test webhook with curl
curl -X POST http://localhost:3000/api/practo/webhook \
  -H "Content-Type: application/json" \
  -H "x-practo-signature: test_signature" \
  -d '{
    "event": "booking.created",
    "data": {
      "booking_id": "PRACTO123",
      "doctor_id": "DOC456",
      "date": "2026-03-01",
      "time": "10:00",
      "patient": {
        "name": "Test Patient",
        "phone": "+919876543210"
      }
    }
  }'
```

### 3. Test Booking Push

```bash
# Create a test booking via website
# Check PractoSync table for sync status
psql $DATABASE_URL -c "SELECT * FROM \"PractoSync\";"
```

---

## Monitoring

### Check Sync Logs

```sql
SELECT * FROM "SlotSyncLog" 
ORDER BY "syncedAt" DESC 
LIMIT 10;
```

### Check Failed Syncs

```sql
SELECT * FROM "PractoSync" 
WHERE status = 'failed' 
ORDER BY "lastSyncedAt" DESC;
```

### Retry Failed Syncs

Failed syncs are automatically retried up to 3 times. To manually retry:

```typescript
import { practoService } from '@/lib/services/practo';

const retried = await practoService.retryFailedSyncs();
console.log(`Retried ${retried} failed syncs`);
```

---

## Scheduled Sync (Optional)

For automatic periodic syncs, set up a cron job or use Vercel Cron:

**vercel.json**:
```json
{
  "crons": [
    {
      "path": "/api/practo/sync",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

This syncs slots every 2 hours.

---

## Troubleshooting

### Issue: Slots not syncing

**Check**:
1. Environment variables are configured in Vercel
2. Doctor has `practoId` set in database
3. Practo API credentials are valid
4. Check `SlotSyncLog` for errors

### Issue: Webhook not receiving events

**Check**:
1. Webhook URL is correct in Practo dashboard
2. Webhook secret matches `.env` value  
3. Server is accessible (not localhost)
4. Check Vercel logs for webhook errors

### Issue: Signature verification failing

**Solution**: Ensure `PRACTO_WEBHOOK_SECRET` matches exactly in both:
- Practo dashboard webhook configuration
- Your `.env.local` and Vercel environment variables

---

## Production Checklist

- [ ] Practo API credentials added to Vercel
- [ ] All doctors linked with `practoId` in database
- [ ] Webhook URL configured in Practo dashboard
- [ ] Webhook signature verification working
- [ ] Initial slot sync completed successfully
- [ ] Test booking pushed to Practo successfully
- [ ] Webhook events being received and processed
- [ ] Monitoring logs for sync errors
- [ ] Scheduled sync configured (if needed)

---

## Support

For Practo API issues: partner-support@practo.com  
For integration issues: Check Vercel logs and database sync logs
