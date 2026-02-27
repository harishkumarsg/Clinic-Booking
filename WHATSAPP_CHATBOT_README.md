# WhatsApp Chatbot Integration Guide
## Dr. Sindhu's Skin Clinic - IVR + WhatsApp Hybrid System

---

## 📋 **What's Been Built**

### ✅ Completed Features:

1. **Database Models** (PostgreSQL)
   - `WhatsAppConversation` - Tracks conversation state per phone number
   - `WhatsAppMessage` - Logs all incoming/outgoing messages
   - `PharmacyOrder` - Stores pharmacy orders from WhatsApp

2. **Core Services**
   - `TwilioWhatsAppService` - Send/receive WhatsApp messages via Twilio
   - `ConversationManager` - Manage conversation state and database operations
   - `WhatsAppMessageHandler` - Process messages and route based on conversation state

3. **API Endpoints**
   - `/api/whatsapp/webhook` - Receives incoming WhatsApp messages from Twilio
   - `/api/whatsapp/send` - Send WhatsApp messages (for testing & IVR trigger)
   - `/api/ivr/webhook` - Handle voice calls with IVR menu

4. **Conversation Flow Implemented**
   - Patient identification (new/existing)
   - Name capture for new patients
   - Main menu (Appointment, Pharmacy, Talk to Staff, View Bookings)
   - Appointment type selection (Consultation vs Procedure)
   - Treatment category (Skin/Hair)
   - Treatment selection with pricing
   - Slot selection (date/time)
   - Payment options (₹50 partial or ₹900 full)
   - Pharmacy order flow with prescription upload
   - Duration capture for medicines

---

## 🚀 **Setup Instructions**

### **Step 1: Twilio WhatsApp Sandbox Setup**

1. **Sign up for Twilio** (if you haven't):
   - Go to: https://www.twilio.com/console
   - Create account (free trial available)

2. **Enable WhatsApp Sandbox**:
   - Navigate to: **Messaging** → **Try it Out** → **Send a WhatsApp message**
   - Follow instructions to join the sandbox by sending `join <sandbox-code>` to Twilio's WhatsApp number
   - Example: Send "join happy-tiger" to +1 415 523 8886

3. **Configure Webhook**:
   - In Twilio Console, go to **Messaging** → **Settings** → **WhatsApp Sandbox Settings**
   - Set **"When a message comes in"** to:
     ```
     https://your-domain.vercel.app/api/whatsapp/webhook
     ```
   - HTTP Method: **POST**
   - Save configuration

### **Step 2: Environment Variables**

Already configured in `.env.local`:
```env
TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="your_twilio_phone_number"
```

✅ These are already set up!

### **Step 3: Test the Chatbot**

1. **Local Testing** (using ngrok):
   ```bash
   # Install ngrok if you haven't
   npm install -g ngrok
   
   # Start your dev server
   pnpm dev
   
   # In another terminal, expose your local server
   ngrok http 3000
   
   # Copy the ngrok URL (e.g., https://abc123.ngrok.io)
   # Update Twilio webhook to: https://abc123.ngrok.io/api/whatsapp/webhook
   ```

2. **Production Testing**:
   - Deploy to Vercel
   - Update Twilio webhook to: `https://clinic-booking-vkfq.vercel.app/api/whatsapp/webhook`

3. **Send Test Message**:
   - Send "Hi" to your Twilio WhatsApp number
   - The bot should respond with a greeting and name request (if new) or main menu (if existing)

---

## 🎯 **How It Works**

### **Flow Architecture:**

```
┌─────────────┐
│ Patient Call│
│   (Phone)   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   IVR System    │ ← /api/ivr/webhook
│  (Twilio Voice) │
└────────┬────────┘
         │
    ┌────┴────┐
    │  Menu:  │
    │  1,2,3,4│
    └────┬────┘
         │
    ┌────┴──────────────────┐
    │                       │
    ▼                       ▼
┌─────────┐          ┌──────────┐
│ Option 1│          │ Option 3 │
│   or 2  │          │Talk Staff│
└────┬────┘          └──────────┘
     │
     ▼
┌──────────────────────┐
│ Send WhatsApp Link   │
│ /api/whatsapp/send   │
└──────────┬───────────┘
           │
           ▼
┌────────────────────────┐
│  Patient's WhatsApp    │
│  "Reply Hi to start"   │
└───────────┬────────────┘
            │
            ▼
┌───────────────────────────┐
│  WhatsApp Message Handler │ ← /api/whatsapp/webhook
│   (State Machine)         │
└───────────┬───────────────┘
            │
      ┌─────┴──────┐
      │ State Flow │
      └─────┬──────┘
            │
    ┌───────┼───────────┬────────────┐
    │       │           │            │
    ▼       ▼           ▼            ▼
┌────────┐ ┌─────┐ ┌─────────┐ ┌─────────┐
│Patient │ │Main │ │Procedure│ │ Payment │
│  Check │ │Menu │ │Selection│ │ Process │
└────────┘ └─────┘ └─────────┘ └─────────┘
```

### **Conversation States:**

| State | Description | Next Actions |
|-------|-------------|--------------|
| `GREETING` | Welcome message | Check if patient exists |
| `CAPTURE_NAME` | Ask for name | Store name, show main menu |
| `APPOINTMENT_TYPE` | Main menu | 1-Appointment, 2-Pharmacy, 3-Staff |
| `PROCEDURE_CATEGORY` | Appointment type | Consultation or Procedure |
| `PROCEDURE_TREATMENT` | Category selection | Skin or Hair treatments |
| `SLOT_SELECTION_*` | Date/time picker | Show available slots |
| `PAYMENT_OPTIONS` | Payment method | ₹50 or ₹900 |
| `PHARMACY_UPLOAD` | Upload prescription | Accept image/PDF |
| `PHARMACY_DURATION` | Medicine duration | Days count |

---

## 🧪 **Testing the Chatbot**

### **Test Conversation Flow:**

```
User: Hi
Bot: Welcome to Dr. Sindhu's Skin Clinic! 
     I see you're a new patient. What's your name?

User: John
Bot: Hello John! 👋
     How can I help you today?
     1️⃣ Book Appointment
     2️⃣ Order Medicines
     3️⃣ Talk to Staff
     4️⃣ View Bookings

User: 1
Bot: Great! What type of appointment?
     1️⃣ Consultation
     2️⃣ Procedure

User: 2
Bot: 💉 Select Treatment Category
     1️⃣ Skin Treatments
     2️⃣ Hair Treatments

User: 1
Bot: 🧴 Skin Treatments
     1️⃣ HydraFacial - ₹2500
     2️⃣ Chemical Peel - ₹1200
     3️⃣ Botox - ₹8000
     ...

User: 1
Bot: ⚠️ Consultation is required before any procedure.
     1️⃣ Book consultation first
     2️⃣ I'll schedule later

User: 1
Bot: 📅 Available Consultation Slots
     1️⃣ Today (Feb 26)
     2️⃣ Tomorrow (Feb 27)
     3️⃣ Day after (Feb 28)

User: 2
Bot: 💳 Payment Options
     Your slot is temporarily held.
     1️⃣ Pay ₹50 booking fee
     2️⃣ Pay full ₹900 and book now

User: 1
Bot: 💳 Payment Required
     Click here to pay: [payment link]
```

### **Global Commands:**
- `Menu` - Return to main menu
- `Cancel` - Cancel current session
- `Stop` - Same as cancel

---

## 🔧 **What Still Needs to Be Done**

### **High Priority:**

1. ⏰ **Real Slot Management**
   - Integrate with existing `Slot` model
   - Show real available slots from database
   - Implement slot locking/reservation logic

2. 💳 **Payment Gateway Integration**
   - Razorpay/Stripe integration
   - Generate actual payment links
   - Handle payment webhooks
   - Update booking status on payment success

3. 🔄 **Booking Confirmation**
   - Create booking in database after payment
   - Send WhatsApp confirmation message
   - Update Clinicea/Practo calendars

4. ⏱️ **Inactivity Handling**
   - Implement 1-hour timeout
   - Send reminder after inactivity
   - Release slot if no response
   - Auto-cancel expired sessions

### **Medium Priority:**

5. 📋 **View Bookings**
   - Fetch user's booking history
   - Display in WhatsApp message format
   - Show upcoming appointments

6. 📞 **Staff Notification**
   - Alert staff when patient requests callback
   - Send pharmacy orders to staff dashboard
   - Email/SMS notifications to clinic

7. 🔐 **Patient Verification**
   - OTP verification for sensitive operations
   - Link WhatsApp number to user account

### **Low Priority:**

8. 🌐 **Multi-language Support**
   - Add Tamil/Hindi translations
   - Language selection menu

9. 📊 **Analytics Dashboard**
   - Track conversation metrics
   - Monitor conversion rates
   - Bot performance insights

---

## 📝 **API Endpoints Reference**

### **WhatsApp Webhook** (POST)
```
POST /api/whatsapp/webhook
```
- Receives messages from Twilio
- Processes conversation flow
- Sends automated responses

### **Send WhatsApp Message** (POST)
```
POST /api/whatsapp/send
Body: { "to": "+919876543210", "fromIVR": true }
```
- Manually send WhatsApp message
- Used by IVR to trigger WhatsApp flow

### **IVR Webhook** (POST)
```
POST /api/ivr/webhook
```
- Handles voice calls
- DTMF menu navigation
- Routes to WhatsApp or staff

---

## 🐛 **Troubleshooting**

### **Bot not responding:**
1. Check Twilio webhook is configured correctly
2. Verify environment variables are set
3. Check Twilio console logs for errors
4. Ensure database is accessible

### **Messages not sending:**
1. Verify Twilio credentials
2. Check Twilio balance/credits
3. Ensure phone numbers are in E.164 format (+919876543210)
4. Check Twilio sandbox is active

### **Database errors:**
1. Run `npx prisma db push` to sync schema
2. Verify DATABASE_URL is correct
3. Check Neon database is active

---

## 🎯 **Next Steps**

1. **Test the basic flow** with Twilio sandbox
2. **Implement payment gateway** (Razorpay)
3. **Connect real slot management** from database
4. **Deploy to production** on Vercel
5. **Apply for WhatsApp Business API** (for production use)
6. **Test with real patients**

---

## 📞 **Support**

For Twilio support: https://www.twilio.com/console/support
For WhatsApp Business API: https://www.twilio.com/whatsapp

**Built for Dr. Sindhu's Skin Clinic** 🏥
