/**
 * Shared OTP Store
 * In-memory storage for OTPs (dev/demo only)
 * For production, use Redis or a database
 */

export interface OTPData {
  otp: string;
  expiresAt: number;
  attempts: number;
}

// Shared Map instance
export const otpStore = new Map<string, OTPData>();

// Cleanup expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(phone);
      console.log(`🧹 Cleaned up expired OTP for ${phone}`);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes
