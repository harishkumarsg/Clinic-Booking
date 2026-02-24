# 🔌 API ARCHITECTURE & INTEGRATION PLAN
## Dr. Sindhu's Skin Clinic - Backend & Practo Integration

**Status:** 📋 DESIGN PHASE  
**For:** Parts 2, 3, 4 Implementation  
**Date:** February 24, 2026

---

## 🎯 OVERVIEW

This document outlines the **complete backend architecture** needed to transform the current frontend-only booking system into a fully integrated, production-ready platform with Practo synchronization.

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (COMPLETED ✅)                     │
├─────────────────────────────────────────────────────────────────────────┤
│  Next.js 16 Frontend (React 19 + TypeScript)                            │
│  - BookingShell, Steps, UI Components                                   │
│  - State Management (useBookingState)                                   │
│  - Google Sign-In Button                                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────────────────┐
│                        API LAYER (TO BE BUILT ⏳)                        │
├─────────────────────────────────────────────────────────────────────────┤
│  Next.js API Routes (/app/api/)                                         │
│  ├── /auth/google                    - OAuth verification               │
│  ├── /auth/otp/*                     - OTP login                        │
│  ├── /slots/*                        - Slot availability                │
│  ├── /bookings/*                     - Booking management               │
│  ├── /patients/*                     - Patient data                     │
│  ├── /practo/sync                    - Practo sync trigger              │
│  └── /practo/webhook                 - Practo event receiver            │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕
┌─────────────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER (TO BE BUILT ⏳)                 │
├─────────────────────────────────────────────────────────────────────────┤
│  Services:                                                               │
│  ├── AuthService          - Google OAuth, JWT, sessions                │
│  ├── SlotService          - Availability, reservation, locking          │
│  ├── BookingService       - Create, update, cancel bookings            │
│  ├── PractoSyncService    - Bidirectional sync logic                   │
│  ├── NotificationService  - Email/SMS sending                          │
│  └── PaymentService       - Payment gateway integration                │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕
┌──────────────────────────┬─────────────────────────────────────────────┐
│    DATABASE (⏳)          │        CACHE LAYER (⏳)                      │
├──────────────────────────┼─────────────────────────────────────────────┤
│  PostgreSQL              │  Redis                                       │
│  - Users                 │  - Slot availability cache                  │
│  - Doctors               │  - Reservation locks (15 min TTL)           │
│  - Services              │  - Session tokens                           │
│  - Slots                 │  - Rate limiting                            │
│  - Bookings              │  - Practo sync queue                        │
│  - PractoSync            │                                             │
└──────────────────────────┴─────────────────────────────────────────────┘
                    ↕                               ↕
┌─────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL INTEGRATIONS (⏳)                          │
├─────────────────────────────────────────────────────────────────────────┤
│  ├── Google OAuth API    - User authentication                         │
│  ├── Practo API          - Slot sync, booking sync                     │
│  ├── Twilio/SNS          - SMS notifications                           │
│  ├── SendGrid/SES        - Email notifications                         │
│  └── Razorpay/Stripe     - Payment processing                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📡 API ENDPOINTS SPECIFICATION

### **1. AUTHENTICATION APIS**

#### **POST /api/auth/google**
**Purpose:** Verify Google OAuth token and create/login user

**Request:**
```json
{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
  "clientId": "YOUR_GOOGLE_CLIENT_ID"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": null,
    "photoUrl": "https://lh3.googleusercontent.com/...",
    "createdAt": "2026-02-24T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

**Implementation:**
```typescript
// app/api/auth/google/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  const { credential, clientId } = await req.json();
  
  // 1. Verify Google token
  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId,
  });
  
  const payload = ticket.getPayload();
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  
  // 2. Find or create user
  let user = await prisma.user.findUnique({
    where: { googleId: payload.sub },
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        googleId: payload.sub,
        email: payload.email!,
        name: payload.name!,
        photoUrl: payload.picture,
      },
    });
  }
  
  // 3. Generate session token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });
  
  return NextResponse.json({
    success: true,
    user,
    token,
    expiresIn: 86400, // 24 hours
  });
}
```

---

#### **POST /api/auth/otp/send**
**Purpose:** Send OTP to phone number (fallback auth)

**Request:**
```json
{
  "phone": "+919876543210"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "otpId": "otp_abc123",
  "expiresIn": 300,
  "message": "OTP sent to +919876543210"
}
```

---

#### **POST /api/auth/otp/verify**
**Purpose:** Verify OTP and login user

**Request:**
```json
{
  "otpId": "otp_abc123",
  "otp": "123456",
  "phone": "+919876543210"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": { ... },
  "token": "eyJhbGci...",
  "expiresIn": 86400
}
```

---

### **2. SLOT MANAGEMENT APIS**

#### **GET /api/slots?date=2026-02-25&serviceId=service-001**
**Purpose:** Get available slots for a date and service

**Response (200 OK):**
```json
{
  "success": true,
  "date": "2026-02-25",
  "serviceId": "service-001",
  "slots": [
    {
      "id": "slot_001",
      "time": "09:00",
      "available": true,
      "period": "morning",
      "source": "website",
      "reservedUntil": null
    },
    {
      "id": "slot_002",
      "time": "09:30",
      "available": false,
      "period": "morning",
      "source": "practo",
      "bookedBy": "booking_xyz",
      "reservedUntil": null
    }
  ],
  "totalSlots": 13,
  "availableSlots": 8,
  "syncedAt": "2026-02-24T10:30:00Z"
}
```

**Implementation:**
```typescript
// app/api/slots/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSlotAvailability } from '@/services/slotService';
import { syncPractoSlots } from '@/services/practoSyncService';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const serviceId = searchParams.get('serviceId');
  
  if (!date) {
    return NextResponse.json({ error: 'Date required' }, { status: 400 });
  }
  
  // 1. Fetch from database
  let slots = await getSlotAvailability(date, serviceId);
  
  // 2. Sync with Practo (if needed)
  const lastSync = await getLastSyncTime(date);
  if (Date.now() - lastSync > 60000) { // 1 min cache
    await syncPractoSlots(date);
    slots = await getSlotAvailability(date, serviceId);
  }
  
  return NextResponse.json({
    success: true,
    date,
    serviceId,
    slots,
    totalSlots: slots.length,
    availableSlots: slots.filter(s => s.available).length,
    syncedAt: new Date().toISOString(),
  });
}
```

---

#### **POST /api/slots/reserve**
**Purpose:** Reserve a slot temporarily (15 min hold)

**Request:**
```json
{
  "slotId": "slot_001",
  "serviceId": "service-001",
  "userId": "user_123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "reservationId": "res_abc123",
  "slotId": "slot_001",
  "expiresAt": "2026-02-24T10:45:00Z",
  "expiresIn": 900
}
```

**Implementation:**
```typescript
// Uses Redis for distributed locking
import { redis } from '@/lib/redis';

export async function reserveSlot(slotId: string, userId: string) {
  // 1. Try to acquire lock
  const lockKey = `lock:slot:${slotId}`;
  const locked = await redis.set(lockKey, userId, 'EX', 900, 'NX');
  
  if (!locked) {
    throw new Error('Slot already reserved');
  }
  
  // 2. Create reservation in DB
  const reservation = await prisma.reservation.create({
    data: {
      slotId,
      userId,
      expiresAt: new Date(Date.now() + 900000), // 15 min
      status: 'reserved',
    },
  });
  
  return reservation;
}
```

---

### **3. BOOKING APIS**

#### **POST /api/bookings/create**
**Purpose:** Confirm booking and process payment

**Request:**
```json
{
  "reservationId": "res_abc123",
  "patientInfo": {
    "name": "John Doe",
    "phone": "+919876543210",
    "email": "john@example.com",
    "dateOfBirth": "1990-05-15",
    "concerns": "Acne treatment"
  },
  "paymentInfo": {
    "method": "razorpay",
    "transactionId": "pay_xyz123",
    "amount": 500
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "booking": {
    "id": "BOOKING-1708774800000",
    "userId": "user_123",
    "doctorId": "dr-sindhu-001",
    "serviceId": "service-001",
    "slotId": "slot_001",
    "date": "2026-02-25",
    "time": "09:00",
    "status": "confirmed",
    "patientInfo": { ... },
    "paymentStatus": "paid",
    "createdAt": "2026-02-24T10:30:00Z"
  },
  "notifications": {
    "email": "sent",
    "sms": "sent"
  },
  "practoSync": {
    "status": "pending",
    "queuedAt": "2026-02-24T10:30:00Z"
  }
}
```

**Implementation:**
```typescript
// app/api/bookings/create/route.ts
export async function POST(req: NextRequest) {
  const { reservationId, patientInfo, paymentInfo } = await req.json();
  
  // 1. Validate reservation
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { slot: true },
  });
  
  if (!reservation || reservation.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'Reservation expired' },
      { status: 400 }
    );
  }
  
  // 2. Verify payment
  const paymentValid = await verifyPayment(paymentInfo);
  if (!paymentValid) {
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 400 }
    );
  }
  
  // 3. Create booking (transaction)
  const booking = await prisma.$transaction(async (tx) => {
    // Create booking
    const booking = await tx.booking.create({
      data: {
        userId: reservation.userId,
        slotId: reservation.slotId,
        patientInfo,
        paymentInfo,
        status: 'confirmed',
      },
    });
    
    // Mark slot as booked
    await tx.slot.update({
      where: { id: reservation.slotId },
      data: { available: false, bookedBy: booking.id },
    });
    
    // Delete reservation
    await tx.reservation.delete({
      where: { id: reservationId },
    });
    
    return booking;
  });
  
  // 4. Send notifications (async)
  await sendBookingNotifications(booking);
  
  // 5. Queue Practo sync
  await queuePractoSync(booking.id);
  
  return NextResponse.json({
    success: true,
    booking,
    notifications: { email: 'sent', sms: 'sent' },
    practoSync: { status: 'pending' },
  });
}
```

---

#### **GET /api/bookings/:bookingId**
**Purpose:** Get booking details

**Response (200 OK):**
```json
{
  "success": true,
  "booking": {
    "id": "BOOKING-1708774800000",
    "doctor": { ... },
    "service": { ... },
    "slot": { ... },
    "patientInfo": { ... },
    "status": "confirmed",
    "qrCode": "data:image/png;base64,...",
    "createdAt": "2026-02-24T10:30:00Z"
  }
}
```

---

#### **DELETE /api/bookings/:bookingId**
**Purpose:** Cancel booking

**Response (200 OK):**
```json
{
  "success": true,
  "booking": {
    "id": "BOOKING-1708774800000",
    "status": "cancelled",
    "cancelledAt": "2026-02-24T11:00:00Z"
  },
  "refund": {
    "status": "processed",
    "amount": 500
  },
  "practoSync": {
    "status": "synced",
    "practoStatus": "cancelled"
  }
}
```

---

### **4. PRACTO INTEGRATION APIS**

#### **POST /api/practo/sync**
**Purpose:** Manually trigger Practo sync for a booking

**Request:**
```json
{
  "bookingId": "BOOKING-1708774800000"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "practoBookingId": "practo_xyz123",
  "status": "synced",
  "syncedAt": "2026-02-24T10:30:00Z"
}
```

**Implementation:**
```typescript
// app/api/practo/sync/route.ts
import { practoClient } from '@/lib/practo';

export async function POST(req: NextRequest) {
  const { bookingId } = await req.json();
  
  // 1. Get booking details
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { slot: true, service: true, doctor: true },
  });
  
  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }
  
  // 2. Create booking on Practo
  const practoBooking = await practoClient.createBooking({
    doctorId: booking.doctor.practoId,
    patientName: booking.patientInfo.name,
    patientPhone: booking.patientInfo.phone,
    appointmentDate: booking.slot.date,
    appointmentTime: booking.slot.time,
    service: booking.service.name,
    notes: booking.patientInfo.concerns,
  });
  
  // 3. Store Practo ID
  await prisma.practoSync.create({
    data: {
      bookingId: booking.id,
      practoBookingId: practoBooking.id,
      status: 'synced',
      syncedAt: new Date(),
    },
  });
  
  return NextResponse.json({
    success: true,
    practoBookingId: practoBooking.id,
    status: 'synced',
    syncedAt: new Date().toISOString(),
  });
}
```

---

#### **POST /api/practo/webhook**
**Purpose:** Receive booking events from Practo

**Request (from Practo):**
```json
{
  "event": "booking.created",
  "timestamp": "2026-02-24T10:30:00Z",
  "data": {
    "practoBookingId": "practo_xyz123",
    "doctorId": "dr-practo-001",
    "patientName": "Jane Smith",
    "patientPhone": "+919876543210",
    "appointmentDate": "2026-02-25",
    "appointmentTime": "10:00",
    "status": "confirmed"
  }
}
```

**Response (200 OK):**
```json
{
  "received": true,
  "processed": true,
  "bookingId": "BOOKING-1708774900000"
}
```

**Implementation:**
```typescript
// app/api/practo/webhook/route.ts
export async function POST(req: NextRequest) {
  const payload = await req.json();
  
  // 1. Verify webhook signature
  const signature = req.headers.get('x-practo-signature');
  if (!verifyPractoSignature(payload, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const { event, data } = payload;
  
  switch (event) {
    case 'booking.created':
      await handlePractoBookingCreated(data);
      break;
    case 'booking.cancelled':
      await handlePractoBookingCancelled(data);
      break;
    case 'booking.rescheduled':
      await handlePractoBookingRescheduled(data);
      break;
  }
  
  return NextResponse.json({ received: true, processed: true });
}

async function handlePractoBookingCreated(data: any) {
  // 1. Find corresponding slot
  const slot = await prisma.slot.findFirst({
    where: {
      date: data.appointmentDate,
      time: data.appointmentTime,
      available: true,
    },
  });
  
  if (!slot) {
    // Slot already booked on website
    throw new Error('Slot not available');
  }
  
  // 2. Create booking in our system
  const booking = await prisma.booking.create({
    data: {
      slotId: slot.id,
      source: 'practo',
      patientInfo: {
        name: data.patientName,
        phone: data.patientPhone,
      },
      status: 'confirmed',
    },
  });
  
  // 3. Mark slot as unavailable
  await prisma.slot.update({
    where: { id: slot.id },
    data: { available: false, bookedBy: booking.id },
  });
  
  // 4. Store Practo sync record
  await prisma.practoSync.create({
    data: {
      bookingId: booking.id,
      practoBookingId: data.practoBookingId,
      status: 'synced',
    },
  });
  
  // 5. Invalidate slot cache
  await redis.del(`slots:${data.appointmentDate}`);
}
```

---

## 🗄️ DATABASE SCHEMA

### **PostgreSQL Schema (using Prisma)**

```prisma
// prisma/schema.prisma

model User {
  id            String    @id @default(cuid())
  googleId      String?   @unique
  email         String    @unique
  name          String
  phone         String?
  photoUrl      String?
  dateOfBirth   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  bookings      Booking[]
  reservations  Reservation[]
}

model Doctor {
  id              String    @id @default(cuid())
  name            String
  title           String
  specialization  String
  experience      String
  rating          Float     @default(0)
  reviews         Int       @default(0)
  photo           String
  location        String
  practoId        String?   @unique
  active          Boolean   @default(true)
  slots           Slot[]
}

model Service {
  id          String    @id @default(cuid())
  name        String
  description String
  duration    Int       // minutes
  priceFrom   Int
  icon        String
  popular     Boolean   @default(false)
  active      Boolean   @default(true)
  bookings    Booking[]
}

model Slot {
  id            String        @id @default(cuid())
  doctorId      String
  doctor        Doctor        @relation(fields: [doctorId], references: [id])
  date          DateTime
  time          String        // HH:MM
  period        String        // morning/afternoon/evening
  available     Boolean       @default(true)
  bookedBy      String?
  source        String?       // website/practo
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  bookings      Booking[]
  reservations  Reservation[]
  
  @@unique([doctorId, date, time])
  @@index([date, available])
}

model Reservation {
  id          String    @id @default(cuid())
  slotId      String
  slot        Slot      @relation(fields: [slotId], references: [id])
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  expiresAt   DateTime
  status      String    @default("reserved")
  createdAt   DateTime  @default(now())
  
  @@index([expiresAt])
}

model Booking {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  slotId        String
  slot          Slot      @relation(fields: [slotId], references: [id])
  serviceId     String
  service       Service   @relation(fields: [serviceId], references: [id])
  patientInfo   Json
  paymentInfo   Json?
  status        String    @default("confirmed")
  source        String    @default("website")
  qrCode        String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  cancelledAt   DateTime?
  practoSync    PractoSync?
  
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model PractoSync {
  id              String    @id @default(cuid())
  bookingId       String    @unique
  booking         Booking   @relation(fields: [bookingId], references: [id])
  practoBookingId String    @unique
  status          String    // synced/pending/failed
  lastSyncedAt    DateTime  @default(now())
  retryCount      Int       @default(0)
  error           String?
  
  @@index([status])
}

model SlotSyncLog {
  id          String    @id @default(cuid())
  date        DateTime
  source      String    // practo/website
  syncedAt    DateTime  @default(now())
  slotsTotal  Int
  slotsAvail  Int
  duration    Int       // ms
  
  @@index([date, syncedAt])
}
```

---

## 🔄 PRACTO SYNCHRONIZATION STRATEGY

### **Architecture: Hybrid Webhook + Polling**

```
┌─────────────────────────────────────────────────────────────────┐
│                    SLOT SYNCHRONIZATION                          │
└─────────────────────────────────────────────────────────────────┘

WEBSITE BOOKING → PRACTO:
  1. User books on website
  2. Reserve slot (Redis lock, 15 min)
  3. Payment processing
  4. Confirm booking in DB
  5. Queue Practo sync (RabbitMQ/background job)
  6. POST to Practo API (with retry logic)
  7. Store Practo booking ID
  8. Invalidate slot cache

PRACTO BOOKING → WEBSITE:
  1. Practo webhook received
  2. Verify signature
  3. Check slot availability
  4. Lock slot (Redis)
  5. Create booking in DB
  6. Mark slot unavailable
  7. Invalidate cache
  8. Respond 200 OK

CONFLICT RESOLUTION:
  - Website wins (our system is source of truth)
  - Practo sync failures trigger alerts
  - Manual reconciliation dashboard
  - Daily consistency checks
```

### **Pessimistic Locking (Redis)**

```typescript
// services/slotLockService.ts
import { redis } from '@/lib/redis';

export async function acquireSlotLock(
  slotId: string,
  userId: string,
  ttl: number = 900 // 15 minutes
): Promise<boolean> {
  const lockKey = `lock:slot:${slotId}`;
  
  // Try to acquire lock (SET if Not eXists)
  const acquired = await redis.set(
    lockKey,
    userId,
    'EX', ttl,
    'NX'
  );
  
  return acquired === 'OK';
}

export async function releaseSlotLock(slotId: string): Promise<void> {
  const lockKey = `lock:slot:${slotId}`;
  await redis.del(lockKey);
}

export async function checkSlotLock(slotId: string): Promise<string | null> {
  const lockKey = `lock:slot:${slotId}`;
  return await redis.get(lockKey);
}
```

### **Retry Logic (Exponential Backoff)**

```typescript
// services/practoSyncService.ts
async function syncBookingToPracto(
  bookingId: string,
  maxRetries: number = 5
): Promise<void> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const booking = await getBooking(bookingId);
      const practoResponse = await practoClient.createBooking(booking);
      
      await storePractoSyncRecord(bookingId, practoResponse.id);
      return; // Success
      
    } catch (error) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
      
      if (attempt === maxRetries - 1) {
        // Final attempt failed
        await logSyncFailure(bookingId, error);
        await sendAdminAlert(bookingId, error);
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### **Cache Strategy**

```typescript
// services/slotCacheService.ts
import { redis } from '@/lib/redis';

export async function getSlotsCached(date: string): Promise<Slot[]> {
  const cacheKey = `slots:${date}`;
  
  // 1. Try cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // 2. Fetch from DB
  const slots = await prisma.slot.findMany({
    where: { date: new Date(date) },
  });
  
  // 3. Cache for 60 seconds
  await redis.setex(cacheKey, 60, JSON.stringify(slots));
  
  return slots;
}

export async function invalidateSlotCache(date: string): Promise<void> {
  const cacheKey = `slots:${date}`;
  await redis.del(cacheKey);
}
```

---

## 🔔 NOTIFICATION SYSTEM

### **Email Notifications (SendGrid/AWS SES)**

```typescript
// services/emailService.ts
import sgMail from '@sendgrid/mail';

export async function sendBookingConfirmation(booking: Booking) {
  const msg = {
    to: booking.patientInfo.email,
    from: 'noreply@drsindhusclinic.com',
    subject: `Appointment Confirmed - ${booking.id}`,
    html: `
      <h1>Your appointment is confirmed!</h1>
      <p>Hi ${booking.patientInfo.name},</p>
      <p>Date: ${formatDate(booking.slot.date)}</p>
      <p>Time: ${booking.slot.time}</p>
      <p>Service: ${booking.service.name}</p>
      <p>Booking ID: ${booking.id}</p>
      <a href="${process.env.APP_URL}/bookings/${booking.id}">
        View Booking
      </a>
    `,
  };
  
  await sgMail.send(msg);
}
```

### **SMS Notifications (Twilio/AWS SNS)**

```typescript
// services/smsService.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendBookingSMS(booking: Booking) {
  await client.messages.create({
    body: `Hi ${booking.patientInfo.name}, your appointment with Dr. Sindhu is confirmed for ${formatDate(booking.slot.date)} at ${booking.slot.time}. Booking ID: ${booking.id}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: booking.patientInfo.phone,
  });
}
```

---

## 💳 PAYMENT INTEGRATION

### **Razorpay Integration**

```typescript
// services/paymentService.ts
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createPaymentOrder(amount: number, bookingId: string) {
  const order = await razorpay.orders.create({
    amount: amount * 100, // paise
    currency: 'INR',
    receipt: bookingId,
    notes: {
      bookingId,
    },
  });
  
  return order;
}

export async function verifyPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<boolean> {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  
  return expectedSignature === razorpaySignature;
}
```

---

## 🚀 DEPLOYMENT ARCHITECTURE

### **Recommended Stack: Next.js on Vercel + AWS**

```
┌─────────────────────────────────────────────────────────────────┐
│                          VERCEL                                  │
├─────────────────────────────────────────────────────────────────┤
│  - Next.js 16 (Edge Functions)                                  │
│  - Automatic HTTPS                                              │
│  - CDN (Global)                                                 │
│  - Serverless Functions (API routes)                            │
│  - Environment variables                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                          AWS                                     │
├─────────────────────────────────────────────────────────────────┤
│  - RDS PostgreSQL (Multi-AZ)                                    │
│  - ElastiCache Redis (Cluster mode)                             │
│  - SES (Email)                                                  │
│  - SNS (SMS)                                                    │
│  - S3 (File storage)                                            │
│  - CloudWatch (Monitoring)                                      │
└─────────────────────────────────────────────────────────────────┘
```

### **Environment Variables**

```bash
# .env.production

# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Redis
REDIS_URL="redis://host:6379"

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"

# Practo
PRACTO_API_KEY="xxx"
PRACTO_API_SECRET="xxx"
PRACTO_WEBHOOK_SECRET="xxx"

# Payment
RAZORPAY_KEY_ID="rzp_live_xxx"
RAZORPAY_KEY_SECRET="xxx"

# Notifications
SENDGRID_API_KEY="SG.xxx"
TWILIO_ACCOUNT_SID="ACxxx"
TWILIO_AUTH_TOKEN="xxx"
TWILIO_PHONE_NUMBER="+1234567890"

# App
NEXT_PUBLIC_APP_URL="https://drsindhusclinic.com"
JWT_SECRET="xxx"
```

---

## 📊 MONITORING & ANALYTICS

### **Key Metrics to Track**

```typescript
// Booking Funnel
- Hero screen views
- Step 1 completion rate
- Step 2 completion rate
- Step 3 completion rate
- Booking confirmation rate
- Payment success rate

// Performance
- API response times (p50, p95, p99)
- Database query times
- Cache hit rate
- Slot sync success rate
- Practo webhook processing time

// Business
- Total bookings (daily/weekly/monthly)
- Revenue
- Cancellation rate
- Average booking value
- Popular services
- Peak booking hours
```

### **Sentry Error Tracking**

```typescript
// app/layout.tsx
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

---

## ⏱️ IMPLEMENTATION TIMELINE

```
WEEK 1-2: Backend Foundation
  ✓ Setup PostgreSQL + Prisma
  ✓ Implement authentication APIs
  ✓ Setup Redis cache
  ✓ Create booking APIs

WEEK 3-4: Practo Integration
  ✓ Practo API client
  ✓ Webhook handler
  ✓ Sync logic
  ✓ Conflict resolution
  ✓ Testing with Practo sandbox

WEEK 5: Notifications & Payment
  ✓ Email/SMS integration
  ✓ Razorpay integration
  ✓ Payment verification

WEEK 6: Testing & Optimization
  ✓ Load testing
  ✓ Security audit
  ✓ Performance optimization
  ✓ Frontend integration

WEEK 7: Deployment
  ✓ Vercel deployment
  ✓ AWS setup
  ✓ Domain configuration
  ✓ Monitoring setup

WEEK 8: Launch
  ✓ Soft launch (beta users)
  ✓ Bug fixes
  ✓ Public launch
```

---

## ✅ NEXT ACTIONS

1. **Setup Google Cloud Console**
   - Create OAuth 2.0 credentials
   - Get client ID/secret

2. **Setup Practo Developer Account**
   - Apply for API access
   - Get credentials
   - Review documentation

3. **Provision AWS Resources**
   - RDS PostgreSQL
   - ElastiCache Redis
   - SES verified domain

4. **Setup Razorpay**
   - Create account
   - Get API keys
   - Configure webhooks

5. **Begin Backend Development**
   - Start with authentication APIs
   - Then booking flow
   - Finally Practo integration

---

**Document Status:** 📋 Ready for Implementation  
**Estimated Effort:** 6-8 weeks  
**Team Size:** 2-3 developers

