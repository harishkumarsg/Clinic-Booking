# Razorpay Payment Integration Guide

## Overview
The booking system now includes a payment step where users can choose to either:
1. Pay ₹50 booking fee (pay remaining at clinic)
2. Pay full consultation amount (complete payment now)

## Setup Instructions

### 1. Create Razorpay Account
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in to your account
3. Complete KYC verification to go live

### 2. Get API Keys
1. Navigate to Settings → API Keys in the Razorpay dashboard
2. Generate API keys for Test Mode (for development)
3. Copy the **Key ID** and **Key Secret**

### 3. Configure Environment Variables
Add the following to your `.env` file:

```env
# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

**Important:**
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Client-side key (starts with `rzp_test_` for test mode)
- `RAZORPAY_KEY_SECRET` - Server-side key (keep secret, never expose to client)
- For production, use live keys that start with `rzp_live_`

### 4. Testing Payments

#### Test Mode
In test mode, you can use these test card details:
- **Card Number:** 4111 1111 1111 1111
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **Name:** Any name

#### Test UPI
- **UPI ID:** success@razorpay

For more test cards and payment methods, visit [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-upi-details/)

### 5. Payment Flow

1. **Step 1:** User selects date and time
2. **Step 2:** User confirms patient details (name, email, phone)
3. **Step 3 (NEW):** User chooses payment option:
   - Pay ₹50 booking fee
   - Pay full amount (₹500 or service price)
4. **Step 4:** Payment processed through Razorpay
5. **Step 5:** Booking confirmed, confirmation screen shown

### 6. Webhook Configuration (Optional but Recommended)

To handle payment confirmations reliably:

1. Create a webhook endpoint in your API (e.g., `/api/webhooks/razorpay`)
2. Configure webhook URL in Razorpay Dashboard → Settings → Webhooks
3. Select events: `payment.captured`, `payment.failed`
4. Use webhook secret to verify signatures

Example webhook handler:
```typescript
import crypto from 'crypto';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature');
  
  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');
  
  if (signature === expectedSignature) {
    const payload = JSON.parse(body);
    // Handle payment.captured or payment.failed events
  }
}
```

### 7. Going Live

When ready for production:
1. Complete Razorpay KYC verification
2. Switch to live API keys
3. Update `.env` with live keys
4. Test with small real transactions
5. Configure live webhook endpoints

## Features

### Payment Options
- **Partial Payment:** ₹50 booking fee to secure appointment
- **Full Payment:** Complete consultation fee upfront

### User Benefits
- Secure Razorpay checkout
- Multiple payment methods (Cards, UPI, Wallets, NetBanking)
- Instant confirmation
- Payment receipt via email

### Admin Benefits
- Payment tracking with Razorpay dashboard
- Automated reconciliation
- Refund management
- Transaction analytics

## Troubleshooting

### Payment Modal Not Opening
- Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set correctly
- Check browser console for errors
- Ensure Razorpay script is loading

### Payment Successful But Booking Not Created
- Check backend API logs
- Verify payment handler is receiving payment ID
- Ensure database connection is working

### Test Payments Failing
- Use correct test card details
- Check if Razorpay account is in test mode
- Verify API keys are for test mode (start with `rzp_test_`)

## Support

For Razorpay specific issues:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)
- [Integration Guides](https://razorpay.com/docs/payments/payment-gateway/web-integration/)

For implementation help:
- Check console logs for errors
- Review `Step4Payment.tsx` component
- Verify booking flow in `BookingShell.tsx`
