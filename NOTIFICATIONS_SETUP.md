# 📧 Email & SMS Setup Guide (Optional)

This guide shows you how to enable **real email and SMS notifications** for production use. In development, the system works perfectly without any configuration - all notifications are logged to the console.

---

## 🎯 Current Status

**Without configuration:**
- ✅ Bookings work perfectly
- ✅ Email content logs to terminal
- ✅ SMS content logs to terminal
- ✅ No external dependencies needed
- ✅ Perfect for development and testing

**With configuration (this guide):**
- ✅ Real emails sent to patients
- ✅ Real SMS sent to patients
- ✅ Production-ready notifications

---

## 📧 Email Setup

### **Option 1: SendGrid (Recommended for Production)**

**Best for:** Production websites with many users

**Free tier:** 100 emails/day forever

**Steps:**

1. **Create account:** https://signup.sendgrid.com

2. **Verify sender email:**
   - Go to Settings → Sender Authentication
   - Click "Verify a Single Sender"
   - Email: `noreply@drsindhusclinic.com` (or your domain)
   - Complete verification

3. **Create API key:**
   - Settings → API Keys
   - Click "Create API Key"
   - Name: "Booking System"
   - Permissions: Full Access
   - Copy the key (starts with `SG.`)

4. **Add to `.env.local`:**
   ```env
   SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxxx"
   EMAIL_FROM="noreply@drsindhusclinic.com"
   ```

5. **Restart server:**
   ```bash
   pnpm dev
   ```

6. **Test:** Make a booking and check your email!

---

### **Option 2: Gmail SMTP (Good for Development/Testing)**

**Best for:** Development, testing, small-scale use

**Free tier:** 500 emails/day

**Steps:**

1. **Enable 2-Factor Authentication:**
   - Go to Google Account → Security
   - Enable 2-Step Verification

2. **Create App Password:**
   - Google Account → Security → 2-Step Verification
   - Scroll to "App passwords"
   - Select app: "Mail"
   - Select device: "Other" → "Booking System"
   - Copy the 16-character password

3. **Add to `.env.local`:**
   ```env
   EMAIL_USER="youremail@gmail.com"
   EMAIL_PASS="abcd efgh ijkl mnop"  # 16-char app password
   EMAIL_FROM="youremail@gmail.com"
   ```

4. **Restart server:**
   ```bash
   pnpm dev
   ```

5. **Test:** Make a booking!

⚠️ **Note:** Gmail has a 500 emails/day limit

---

## 📱 SMS Setup (Twilio)

**Best for:** Critical notifications, reminders

**Cost:** ~₹0.60/SMS in India (~$0.0079/SMS)

**Free trial:** $15 credit (≈ 2000 SMS)

**Steps:**

1. **Create Twilio account:** https://www.twilio.com/try-twilio

2. **Verify phone number:**
   - During signup, verify your phone
   - This is for receiving verification codes

3. **Get a Twilio phone number:**
   - Console → Phone Numbers
   - Get a number (India: +91 or US: +1)
   - Free during trial!

4. **Get credentials:**
   - Console Dashboard
   - Copy:
     - Account SID (starts with `AC`)
     - Auth Token (click to reveal)
     - Phone Number (from step 3)

5. **Add to `.env.local`:**
   ```env
   TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxx"
   TWILIO_AUTH_TOKEN="your_auth_token"
   TWILIO_PHONE_NUMBER="+1234567890"
   ```

6. **For India numbers:**
   ```env
   TWILIO_PHONE_NUMBER="+911234567890"  # Must start with +91
   ```

7. **Restart server:**
   ```bash
   pnpm dev
   ```

8. **Test:** Make a booking and check your phone!

---

## 🧪 Testing Notifications

### **Test Email Without Booking:**

Create a test file `test-email.ts`:

```typescript
import { EmailService } from './lib/services/email';

async function test() {
  await EmailService.sendBookingConfirmation({
    patientName: 'Test User',
    patientEmail: 'yourrealemail@gmail.com',  // Your email
    doctorName: 'Dr. Sindhu Ragavi',
    serviceName: 'Acne Treatment',
    date: 'Thursday, 26 February 2026',
    time: '11:00 AM',
    location: 'Velachery, Chennai',
    bookingId: 'BOOKING-TEST123',
    fee: 500,
  });
  console.log('✅ Test email sent!');
}

test();
```

Run:
```bash
npx tsx test-email.ts
```

### **Test SMS Without Booking:**

Create `test-sms.ts`:

```typescript
import { SMSService } from './lib/services/sms';

async function test() {
  await SMSService.sendBookingConfirmation({
    phone: '+917845892873',  // Your phone
    patientName: 'Test User',
    doctorName: 'Dr. Sindhu Ragavi',
    serviceName: 'Acne Treatment',
    date: '26 Feb',
    time: '11:00 AM',
    location: 'Velachery, Chennai',
    bookingId: 'BOOKING-TEST123',
  });
  console.log('✅ Test SMS sent!');
}

test();
```

Run:
```bash
npx tsx test-sms.ts
```

---

## 💰 Cost Estimates

### **Email:**
- **SendGrid Free:** 100 emails/day forever → **FREE**
- **SendGrid Starter:** $19.95/month → 50,000 emails
- **Gmail:** 500 emails/day → **FREE**

### **SMS:**
- **Twilio Trial:** $15 credit → ~2000 SMS → **FREE**
- **Twilio India:** ₹0.60/SMS
- **Monthly estimate:** 100 bookings/month = ₹60/month (~$0.75)

### **Total for 100 bookings/month:**
- Email: **FREE** (SendGrid/Gmail)
- SMS: **₹60** ($0.75)
- **Total: ₹60/month** ($0.75) 🎉

---

## 🔍 Troubleshooting

### **Email not sending (SendGrid)**

1. **Check sender verification:**
   - SendGrid → Settings → Sender Authentication
   - Status should be "Verified"

2. **Check API key:**
   - Must start with `SG.`
   - Copy it correctly (no spaces)

3. **Check console logs:**
   ```
   ✅ Booking confirmation email sent to user@example.com via SendGrid
   ```

4. **Check spam folder** in recipient's inbox

### **Email not sending (Gmail)**

1. **2FA enabled?**
   - Must enable 2-Step Verification first

2. **Using App Password?**
   - Not your regular Gmail password
   - Must use 16-character app password

3. **Check "Less secure app access":**
   - Not needed if using App Password

### **SMS not sending**

1. **Trial account limitations:**
   - Can only send to verified numbers
   - Verify recipient number in Twilio Console

2. **Phone number format:**
   - Must include country code
   - India: `+917845892873`
   - US: `+11234567890`

3. **Check Twilio dashboard:**
   - Console → Monitor → Logs
   - See SMS delivery status

---

## 📊 Monitoring

### **Check notification logs:**

```bash
# Terminal output shows:
✅ Booking confirmation email sent to user@example.com via SendGrid
✅ SMS sent to +917845892873. SID: SM1234567890
```

### **SendGrid Dashboard:**
- https://app.sendgrid.com/stats
- See delivery rates, opens, clicks

### **Twilio Dashboard:**
- https://console.twilio.com/monitor/logs
- See SMS delivery status, errors

---

## 🎯 Recommendations

**For Development:**
- ❌ Don't configure anything
- ✅ Use console logs (current setup)

**For Small Clinic (< 50 patients/month):**
- ✅ SendGrid Free (email)
- ✅ Twilio Trial ($15 credit for SMS)
- 💰 Cost: FREE for first few months

**For Medium Clinic (100-500 patients/month):**
- ✅ SendGrid Free (email)
- ✅ Twilio Pay-as-you-go (SMS)
- 💰 Cost: ₹300-1500/month ($4-20/month)

**For Large Clinic (1000+ patients/month):**
- ✅ SendGrid Starter $19.95/month (email)
- ✅ Twilio with volume discounts (SMS)
- 💰 Cost: ₹3000-6000/month ($40-80/month)

---

## ✅ Quick Setup Checklist

- [ ] Choose email provider (SendGrid or Gmail)
- [ ] Create account
- [ ] Get API key/credentials
- [ ] Add to `.env.local`
- [ ] Restart server
- [ ] Test with a booking
- [ ] Check email/SMS received
- [ ] Monitor delivery in dashboard

---

## 🚀 You're All Set!

**With notifications configured:**
- Patients get instant email confirmations
- Patients get SMS confirmations
- Beautiful HTML email templates
- Professional branding
- Automated reminders (can add later)

**Without configuration:**
- Everything still works!
- Logs show what would be sent
- Perfect for development

**The choice is yours!** 🎉
