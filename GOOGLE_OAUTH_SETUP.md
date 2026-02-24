# 🔐 Google OAuth Setup Guide

## Quick Setup (5 minutes)

To fix the **"Error 401: invalid_client"** error and enable Google Sign-In:

### Step 1: Create Google Cloud Project

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**
2. Click **"Create Project"** or select existing project
3. Name it: `Dr Sindhu Clinic` (or any name)
4. Click **"Create"**

### Step 2: Enable Google+ API

1. In your project, go to **"APIs & Services" → "Library"**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click **"Enable"**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services" → "Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure **"OAuth consent screen"** first:
   - User Type: **External**
   - App name: `Dr. Sindhu's Skin Clinic`
   - User support email: Your email
   - Developer contact: Your email
   - Click **"Save and Continue"** through all steps

4. Back to **"Create OAuth client ID"**:
   - Application type: **Web application**
   - Name: `Booking System`
   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     http://127.0.0.1:3000
     ```
   - **Authorized redirect URIs:**
     ```
     http://localhost:3000
     http://localhost:3000/api/auth/callback/google
     ```
   - Click **"Create"**

5. **Copy the Client ID** (looks like: `123456-abc.apps.googleusercontent.com`)

### Step 4: Update .env.local File

1. Open `.env.local` in your project root
2. Replace the placeholder:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID="YOUR_ACTUAL_CLIENT_ID_HERE"
   ```
   
3. Example:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID="123456789-abc123def456.apps.googleusercontent.com"
   ```

### Step 5: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
pnpm dev
```

### Step 6: Test Google Sign-In

1. Go to **http://localhost:3000**
2. Navigate to Step 3 (Confirm Details)
3. Click **"Continue with Google"**
4. Select your Google account
5. ✅ Should work now!

---

## Troubleshooting

### Error: "Access blocked: Authorization error"

**Solution:** Add your email as a test user
1. Go to **OAuth consent screen**
2. Scroll to **"Test users"**
3. Click **"+ ADD USERS"**
4. Add your Gmail address
5. Save

### Error: "redirect_uri_mismatch"

**Solution:** Add localhost to authorized origins
1. Go to **Credentials** → Click your OAuth client
2. Under **"Authorized JavaScript origins"**, add:
   - `http://localhost:3000`
3. Under **"Authorized redirect URIs"**, add:
   - `http://localhost:3000`
4. Click **"Save"**

### Error: "invalid_client"

**Solution:** Check your Client ID
1. Make sure `.env.local` has the correct `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
2. Restart the dev server after changing `.env.local`
3. Clear browser cache

---

## Production Setup (For Live Website)

When deploying to production (e.g., `https://drsindhusclinic.com`):

1. Go back to **Google Cloud Credentials**
2. Add your production domain:
   - **Authorized JavaScript origins:**
     ```
     https://drsindhusclinic.com
     https://www.drsindhusclinic.com
     ```
   - **Authorized redirect URIs:**
     ```
     https://drsindhusclinic.com
     https://drsindhusclinic.com/api/auth/callback/google
     ```

3. Update `.env.production`:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-client-id"
   NEXT_PUBLIC_APP_URL="https://drsindhusclinic.com"
   ```

4. Set OAuth consent screen to **"In production"** (requires verification)

---

## Environment Variables Reference

```env
# Required for Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID="123456-abc.apps.googleusercontent.com"

# Optional (for backend token verification)
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxx"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# JWT Secret (for session tokens)
JWT_SECRET="your-super-secret-key"
```

---

## Testing the Integration

Once configured, test these flows:

### 1. **Google Sign-In Flow**
   - [x] Click "Continue with Google"
   - [x] Select Google account
   - [x] Name auto-fills in form
   - [x] Email auto-fills
   - [x] Profile picture appears

### 2. **API Endpoints**
   ```bash
   # Test auth endpoint (requires valid Google token)
   curl -X POST http://localhost:3000/api/auth/google \
     -H "Content-Type: application/json" \
     -d '{"credential":"YOUR_GOOGLE_JWT_TOKEN"}'
   ```

### 3. **Session Persistence**
   - Sign in → Check sessionStorage for `auth_token`
   - Refresh page → Should remain signed in
   - Close tab → Session ends (by design)

---

## Security Checklist

- [x] Use HTTPS in production
- [x] Never commit `.env.local` to Git
- [x] Rotate JWT_SECRET regularly
- [x] Add only necessary test users
- [x] Enable 2FA for Google Cloud account
- [x] Monitor API usage in Google Cloud Console

---

## Next Steps

After Google OAuth is working:

1. **Add Database** (Part 3)
   - Replace in-memory storage with PostgreSQL
   - Store users, bookings, reservations

2. **Add Practo Integration** (Part 3)
   - Webhook endpoints
   - Slot synchronization
   - Conflict resolution

3. **Add Payment Gateway** (Part 4)
   - Razorpay/Stripe integration
   - Payment verification
   - Receipt generation

4. **Add Notifications** (Part 4)
   - Email (SendGrid/AWS SES)
   - SMS (Twilio/AWS SNS)
   - Booking confirmations

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Check server terminal for API errors
3. Verify `.env.local` has correct values
4. Restart development server
5. Clear browser cache and cookies

**Google Cloud Console:** https://console.cloud.google.com/apis/credentials

---

✅ **After setup, you should see successful Google Sign-In with auto-filled form fields!**
