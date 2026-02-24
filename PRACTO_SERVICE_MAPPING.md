# 🔄 Practo Service Mapping Strategy

## 🚨 PROBLEM IDENTIFIED

### Current Situation:

**PRACTO PROFILE:**
```
Dr. B. Sindhu Raaghavi
└─ Consultant Dermatologist (₹1200)
   └─ Generic consultation service only
```

**OUR WEBSITE:**
```
Dr. Sindhu Ragavi
├─ Acne Treatment (₹500, 45 min)
├─ Anti-Aging & Wrinkles (₹1500, 60 min)
├─ Skin Pigmentation (₹1000, 45 min)
├─ Laser Hair Removal (₹2000, 30 min)
├─ Chemical Peels (₹1200, 40 min)
└─ General Consultation (₹300, 30 min)
```

### The Challenge:

When a user books "Acne Treatment (₹500)" on our website:
- Which service do we book on Practo? (Only has "Consultant Dermatologist ₹1200")
- Price mismatch: ₹500 vs ₹1200
- Duration mismatch: 45 min vs unknown
- Service name mismatch: Specific vs Generic

**Result:** Cannot sync bookings properly without mapping strategy

---

## ✅ SOLUTION OPTIONS

### **Option 1: Contact Practo Support (RECOMMENDED)**

**Action Steps:**
1. Contact Practo at `support@practo.com` or through partner dashboard
2. Request to add all 6 service types to clinic profile
3. Provide service details:

```
Service Name              | Price | Duration
─────────────────────────┼───────┼─────────
Acne Treatment           | ₹500  | 45 min
Anti-Aging & Wrinkles    | ₹1500 | 60 min
Skin Pigmentation        | ₹1000 | 45 min
Laser Hair Removal       | ₹2000 | 30 min
Chemical Peels           | ₹1200 | 40 min
General Consultation     | ₹300  | 30 min
```

4. Once approved, update Practo profile
5. Update our service mapping configuration

**Pros:**
- ✅ Perfect 1:1 service mapping
- ✅ Price consistency across both platforms
- ✅ Duration/slot synchronization works perfectly
- ✅ Users see accurate service descriptions
- ✅ Professional presentation

**Cons:**
- ❌ Requires Practo approval (may take 2-7 days)
- ❌ Depends on Practo's service management policies

**Timeline:** 3-7 business days

---

### **Option 2: Universal Mapping via Comments (IMMEDIATE)**

**How It Works:**

All website services map to "Consultant Dermatologist" on Practo, with service details in the notes field.

**Implementation:**

```typescript
// lib/services/practo.ts
async pushBooking(bookingData) {
  // Map to Practo's generic service
  const practoPayload = {
    doctor_id: process.env.PRACTO_DOCTOR_ID,
    service_name: "Consultant Dermatologist",
    date: bookingData.date,
    time: bookingData.startTime,
    duration: 60, // Standard slot
    
    // Put actual service in notes
    notes: `Service: ${bookingData.serviceName}
            Price: ₹${bookingData.price}
            Duration: ${bookingData.duration} min
            Patient notes: ${bookingData.patientConcern || 'N/A'}`,
    
    patient_name: bookingData.patientName,
    patient_email: bookingData.patientEmail,
    patient_phone: bookingData.patientPhone,
  };
  
  // Send to Practo
  const response = await this.client.post('/bookings', practoPayload);
  return response.data;
}
```

**Configuration File:**

```typescript
// lib/config/practo-service-mapping.ts
export const SERVICE_MAPPING = {
  // All services map to generic Practo service
  "acne-treatment": {
    practoServiceId: "GENERIC_CONSULTATION",
    practoServiceName: "Consultant Dermatologist",
    includeInNotes: true,
  },
  "anti-aging": {
    practoServiceId: "GENERIC_CONSULTATION",
    practoServiceName: "Consultant Dermatologist",
    includeInNotes: true,
  },
  "skin-pigmentation": {
    practoServiceId: "GENERIC_CONSULTATION",
    practoServiceName: "Consultant Dermatologist",
    includeInNotes: true,
  },
  "laser-hair-removal": {
    practoServiceId: "GENERIC_CONSULTATION",
    practoServiceName: "Consultant Dermatologist",
    includeInNotes: true,
  },
  "chemical-peels": {
    practoServiceId: "GENERIC_CONSULTATION",
    practoServiceName: "Consultant Dermatologist",
    includeInNotes: true,
  },
  "general-consultation": {
    practoServiceId: "GENERIC_CONSULTATION",
    practoServiceName: "Consultant Dermatologist",
    includeInNotes: true,
  },
};
```

**Pros:**
- ✅ Works immediately (no Practo approval needed)
- ✅ All information preserved in notes
- ✅ Doctor can see actual service requested
- ✅ Can implement today

**Cons:**
- ❌ Practo users don't see specific service in UI
- ❌ Notes might not show in calendar view
- ❌ Less structured data
- ❌ Manual work for doctor to read notes

**Timeline:** Can implement in 30 minutes

---

### **Option 3: Dual-Service Strategy (HYBRID)**

**How It Works:**

Map some common services to Practo, use notes for specialized ones.

```typescript
const SERVICE_MAPPING = {
  // Direct mapping (if Practo has these)
  "general-consultation": {
    practoServiceId: "CONSULTATION",
    practoServiceName: "Consultation",
    mapDirect: true,
  },
  
  // Map to closest Practo service
  "acne-treatment": {
    practoServiceId: "CONSULTATION",
    practoServiceName: "Consultation",
    notes: "Specialized: Acne Treatment (₹500, 45min)",
  },
  
  "anti-aging": {
    practoServiceId: "COSMETIC_PROCEDURE",
    practoServiceName: "Cosmetic Procedure",
    notes: "Anti-Aging & Wrinkles Treatment (₹1500, 60min)",
  },
  
  // ... etc
};
```

**Pros:**
- ✅ Balance between accuracy and practicality
- ✅ Some services map perfectly
- ✅ Others have context in notes

**Cons:**
- ❌ Still requires some Practo services to exist
- ❌ Partial solution only

---

### **Option 4: Price Adjustment (NOT RECOMMENDED)**

**How It Works:**

Adjust Practo prices to match our website averages.

- Change "Consultant Dermatologist" on Practo from ₹1200 → ₹900 (average)
- Map all services to this
- Handle price differences internally

**Pros:**
- ✅ Simpler mapping

**Cons:**
- ❌ Misleading to Practo users
- ❌ Can't differentiate service complexity
- ❌ Reputation risk

---

## 🎯 RECOMMENDED IMPLEMENTATION

**Short-term (Week 1):**
- Implement **Option 2** (Universal Mapping via Comments)
- All services work immediately
- No blockers on Practo

**Long-term (Week 2-3):**
- Contact Practo support for **Option 1**
- Request addition of all 6 service types
- Once approved, migrate to 1:1 mapping

**Fallback:**
- If Practo denies custom services, stay with Option 2
- Consider manual confirmation call for Practo bookings

---

## 📋 IMPLEMENTATION CHECKLIST

### Immediate (Option 2):

```typescript
// 1. Create mapping configuration
□ Create lib/config/practo-service-mapping.ts
□ Define all 6 service mappings
□ Include notes template

// 2. Update Practo service
□ Modify lib/services/practo.ts
□ Add service mapping logic
□ Format notes with service details
□ Test with mock data

// 3. Handle reverse sync (Practo → Website)
□ When webhook received, parse notes
□ Extract actual service from notes
□ Map to correct website service
□ Update local database

// 4. Test
□ Book "Acne Treatment" on website
□ Verify it appears on Practo as "Consultation" with notes
□ Check doctor can see service details
```

### Long-term (Option 1):

```
□ Email Practo support with service list
□ Follow up in 2-3 business days
□ Once approved, update profile
□ Create 1:1 mapping configuration
□ Test each service
□ Deploy to production
```

---

## 🔧 CODE IMPLEMENTATION

### File: `lib/config/practo-service-mapping.ts` (NEW)

```typescript
export interface ServiceMapping {
  websiteServiceId: string;
  websiteServiceName: string;
  websitePrice: number;
  websiteDuration: number;
  practoServiceId: string;
  practoServiceName: string;
  practoDuration?: number;
  mappingType: 'direct' | 'notes' | 'hybrid';
}

export const PRACTO_SERVICE_MAPPINGS: Record<string, ServiceMapping> = {
  'acne-treatment': {
    websiteServiceId: 'acne-treatment',
    websiteServiceName: 'Acne Treatment',
    websitePrice: 500,
    websiteDuration: 45,
    practoServiceId: 'GENERIC_CONSULTATION',
    practoServiceName: 'Consultant Dermatologist',
    practoDuration: 60,
    mappingType: 'notes',
  },
  
  'anti-aging': {
    websiteServiceId: 'anti-aging',
    websiteServiceName: 'Anti-Aging & Wrinkles',
    websitePrice: 1500,
    websiteDuration: 60,
    practoServiceId: 'GENERIC_CONSULTATION',
    practoServiceName: 'Consultant Dermatologist',
    practoDuration: 60,
    mappingType: 'notes',
  },
  
  'skin-pigmentation': {
    websiteServiceId: 'skin-pigmentation',
    websiteServiceName: 'Skin Pigmentation',
    websitePrice: 1000,
    websiteDuration: 45,
    practoServiceId: 'GENERIC_CONSULTATION',
    practoServiceName: 'Consultant Dermatologist',
    practoDuration: 60,
    mappingType: 'notes',
  },
  
  'laser-hair-removal': {
    websiteServiceId: 'laser-hair-removal',
    websiteServiceName: 'Laser Hair Removal',
    websitePrice: 2000,
    websiteDuration: 30,
    practoServiceId: 'GENERIC_CONSULTATION',
    practoServiceName: 'Consultant Dermatologist',
    practoDuration: 60,
    mappingType: 'notes',
  },
  
  'chemical-peels': {
    websiteServiceId: 'chemical-peels',
    websiteServiceName: 'Chemical Peels',
    websitePrice: 1200,
    websiteDuration: 40,
    practoServiceId: 'GENERIC_CONSULTATION',
    practoServiceName: 'Consultant Dermatologist',
    practoDuration: 60,
    mappingType: 'notes',
  },
  
  'general-consultation': {
    websiteServiceId: 'general-consultation',
    websiteServiceName: 'General Consultation',
    websitePrice: 300,
    websiteDuration: 30,
    practoServiceId: 'GENERIC_CONSULTATION',
    practoServiceName: 'Consultant Dermatologist',
    practoDuration: 60,
    mappingType: 'notes',
  },
};

/**
 * Get Practo service mapping for a website service
 */
export function getServiceMapping(websiteServiceId: string): ServiceMapping | null {
  return PRACTO_SERVICE_MAPPINGS[websiteServiceId] || null;
}

/**
 * Format booking notes for Practo
 */
export function formatBookingNotes(
  serviceMapping: ServiceMapping,
  patientConcern?: string
): string {
  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTUAL SERVICE REQUESTED:
━━━━━━━━━━━━━━━━━━━━━━━━━━

Service: ${serviceMapping.websiteServiceName}
Price: ₹${serviceMapping.websitePrice}
Duration: ${serviceMapping.websiteDuration} minutes

${patientConcern ? `Patient Concern:\n${patientConcern}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━
Booked via clinic website
`.trim();
}

/**
 * Parse service from Practo booking notes (reverse sync)
 */
export function parseServiceFromNotes(notes: string): string | null {
  const match = notes.match(/Service:\s*([^\n]+)/);
  if (!match) return null;
  
  const serviceName = match[1].trim();
  
  // Find mapping by service name
  for (const [id, mapping] of Object.entries(PRACTO_SERVICE_MAPPINGS)) {
    if (mapping.websiteServiceName === serviceName) {
      return id;
    }
  }
  
  return null;
}
```

---

### Updated: `lib/services/practo.ts`

```typescript
import { PRACTO_SERVICE_MAPPINGS, getServiceMapping, formatBookingNotes } from '../config/practo-service-mapping';

// In pushBooking method:
async pushBooking(bookingData: BookingData): Promise<any> {
  if (!this.client || !this.config) {
    console.log('📡 PRACTO (DEV MODE): Would push booking:', bookingData);
    return { success: true, bookingId: 'MOCK_PRACTO_' + Date.now() };
  }

  try {
    // Get service mapping
    const serviceMapping = getServiceMapping(bookingData.serviceId);
    
    if (!serviceMapping) {
      throw new Error(`No Practo mapping found for service: ${bookingData.serviceId}`);
    }
    
    // Build Practo payload
    const practoPayload = {
      doctor_id: this.config.doctorId,
      clinic_id: this.config.clinicId,
      
      // Use Practo's generic service
      service_id: serviceMapping.practoServiceId,
      service_name: serviceMapping.practoServiceName,
      
      // Slot details
      date: bookingData.date,
      start_time: bookingData.startTime,
      duration: serviceMapping.practoDuration || 60,
      
      // Patient details
      patient: {
        name: bookingData.patientName,
        email: bookingData.patientEmail,
        phone: bookingData.patientPhone,
      },
      
      // ACTUAL SERVICE IN NOTES
      notes: formatBookingNotes(serviceMapping, bookingData.patientConcern),
      
      // Metadata
      source: 'clinic_website',
      external_id: bookingData.bookingId,
    };
    
    // Send to Practo
    const response = await this.client.post('/bookings', practoPayload, {
      timeout: 10000,
    });
    
    console.log('✅ Practo booking created:', response.data.id);
    return response.data;
    
  } catch (error: any) {
    console.error('❌ Practo pushBooking failed:', error.message);
    throw error;
  }
}
```

---

## 📞 PRACTO CONTACT INFORMATION

**Support Channels:**

1. **Email:** support@practo.com
2. **Partner Dashboard:** https://partners.practo.com
3. **Phone:** 080-68175000 (Bangalore office)
4. **Help Center:** https://help.practo.com

**Email Template:**

```
Subject: Request to Add Service Types - Dr. B. Sindhu Raaghavi (Chennai)

Dear Practo Support Team,

I am managing the digital platform for Dr. B. Sindhu Raaghavi's dermatology 
clinic in Chennai (Velachery Main Road).

Profile: https://www.practo.com/chennai/doctor/dr-sindhu-raagavi-dermatologist-cosmetologist

We would like to add detailed service types to our Practo profile to better 
serve our patients. Currently, we only have "Consultant Dermatologist" listed.

Requested Services:
1. Acne Treatment - ₹500 (45 minutes)
2. Anti-Aging & Wrinkles Treatment - ₹1500 (60 minutes)
3. Skin Pigmentation Treatment - ₹1000 (45 minutes)
4. Laser Hair Removal - ₹2000 (30 minutes)
5. Chemical Peels - ₹1200 (40 minutes)
6. General Dermatology Consultation - ₹300 (30 minutes)

This will help us:
- Provide accurate pricing information to patients
- Manage appointment durations properly
- Integrate our clinic website with Practo seamlessly

Please let me know the process to add these services to our profile.

Thank you,
[Your Name]
[Clinic Name]
[Contact Information]
```

---

## 🎯 NEXT STEPS

**This Week:**
1. ✅ Document the issue (this file)
2. □ Decide on immediate approach (Option 2 recommended)
3. □ Implement service mapping configuration
4. □ Test with mock Practo data
5. □ Contact Practo support for long-term solution

**Next Week:**
1. □ Receive response from Practo
2. □ Update service mapping if approved
3. □ Test with real Practo API
4. □ Deploy to production

---

## 📊 IMPACT ANALYSIS

### Current State:
- ❌ No Practo sync (service mismatch)
- ❌ Manual work to handle Practo bookings
- ❌ Risk of double bookings

### After Option 2 (Immediate):
- ✅ Automatic sync working
- ✅ Service details in notes
- ⚠️ Not perfect but functional

### After Option 1 (Long-term):
- ✅ Perfect 1:1 sync
- ✅ Professional presentation
- ✅ Full automation

---

**End of Service Mapping Strategy**

*Status: Ready to implement Option 2 immediately*  
*Long-term: Awaiting Practo service approval*
