'use client';

import { PatientInfo } from '@/lib/types/booking';
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Loader2 } from 'lucide-react';

interface Step3ConfirmProps {
  patient: Partial<PatientInfo>;
  onSetPatient: (patient: Partial<PatientInfo>) => void;
  onConfirm: () => void;
  onBack: () => void;
  isConfirming?: boolean;
}

export function Step3Confirm({
  patient,
  onSetPatient,
  onConfirm,
  onBack,
  isConfirming = false,
}: Step3ConfirmProps) {
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [mobileForOTP, setMobileForOTP] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      const authToken = sessionStorage.getItem('auth_token');
      const storedUser = sessionStorage.getItem('user_info');
      
      if (authToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          // Auto-populate with stored user data if not already set
          if (!patient.email && userData.email) {
            // Google authenticated user
            onSetPatient({
              name: userData.name,
              email: userData.email,
              photoUrl: userData.picture,
              googleId: userData.sub,
            });
          } else if (!patient.phone && userData.phone) {
            // OTP authenticated user
            onSetPatient({
              phone: userData.phone,
            });
          }
          setShowForm(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      } else if (patient.email || patient.phone) {
        // If patient data already exists in state, show form
        setShowForm(true);
      }
    };

    checkAuth();
  }, []);

  const handleGoogleSuccess = async (data: {
    name: string;
    email: string;
    picture?: string;
    sub?: string;
  }) => {
    // Store user info in sessionStorage for persistence
    sessionStorage.setItem('user_info', JSON.stringify(data));
    
    // Look up user by email to see if they have previous bookings
    try {
      const response = await fetch('/api/auth/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (result.success && result.user.isExistingUser) {
        // Existing user - auto-fill all available fields
        console.log('👤 Welcome back! Auto-filling your details from previous booking...');
        setIsExistingUser(true);
        
        onSetPatient({
          name: data.name,
          email: data.email,
          phone: result.user.phone || '',
          dateOfBirth: result.user.dateOfBirth || '',
          photoUrl: data.picture,
          googleId: data.sub,
        });
      } else {
        // New user - only fill Google data
        console.log('🆕 New Google user - please complete your profile');
        setIsExistingUser(false);
        
        onSetPatient({
          name: data.name,
          email: data.email,
          photoUrl: data.picture,
          googleId: data.sub,
        });
      }
    } catch (error) {
      console.error('Error looking up user:', error);
      // Fallback to basic Google data
      onSetPatient({
        name: data.name,
        email: data.email,
        photoUrl: data.picture,
        googleId: data.sub,
      });
    }
    
    setShowForm(true);
  };

  const handleSendOTP = async () => {
    setOtpError('');
    
    // Validate phone number
    if (!mobileForOTP || mobileForOTP.length !== 10) {
      setOtpError('Please enter a valid 10-digit mobile number');
      return;
    }

    const fullPhone = `+91${mobileForOTP}`;
    
    try {
      setOtpLoading(true);
      
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      console.log('📱 OTP sent successfully:', data.otp); // Dev mode shows OTP in console
      setOtpSent(true);
      setCountdown(60); // 60 seconds cooldown
      setOtpError('');
    } catch (error: any) {
      setOtpError(error.message || 'Failed to send OTP');
      console.error('OTP send error:', error);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setOtpError('');
    
    if (!otpValue || otpValue.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    const fullPhone = `+91${mobileForOTP}`;

    try {
      setOtpLoading(true);

      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          otp: otpValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      // Store token and user info
      sessionStorage.setItem('auth_token', data.token);
      sessionStorage.setItem('user_info', JSON.stringify(data.user));

      // Auto-fill form with user data (existing or new)
      const patientData: any = { phone: fullPhone };
      
      if (data.user.isExistingUser) {
        // Existing user - auto-fill all fields
        console.log('👤 Welcome back! Auto-filling your details...');
        setIsExistingUser(true);
        
        if (data.user.name) patientData.name = data.user.name;
        if (data.user.email) patientData.email = data.user.email;
        if (data.user.dateOfBirth) patientData.dateOfBirth = data.user.dateOfBirth;
      } else {
        // New user
        console.log('🆕 New user - please fill in your details');
        setIsExistingUser(false);
      }
      
      onSetPatient(patientData);
      
      // Show the form
      setShowForm(true);
      setOtpSent(false);
      
      console.log('✅ OTP verified successfully');
    } catch (error: any) {
      setOtpError(error.message || 'OTP verification failed');
      console.error('OTP verification error:', error);
    } finally {
      setOtpLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(-10);
    onSetPatient({ phone: value ? `+91${value}` : '' });
  };

  const handleDOBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSetPatient({ dateOfBirth: e.target.value });
  };

  const handleConcernsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onSetPatient({ concerns: e.target.value });
  };

  // Validate form whenever patient data changes
  useEffect(() => {
    if (showForm) {
      validateForm();
    }
  }, [patient.name, patient.email, patient.phone, patient.dateOfBirth, showForm]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!patient.name?.trim()) {
      newErrors.name = 'Name is required';
    } else if (patient.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email is required only for Google sign-in users
    if (patient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!patient.phone?.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\+91\d{10}$/.test(patient.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian phone number';
    }

    if (!patient.dateOfBirth?.trim()) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const dob = new Date(patient.dateOfBirth);
      const age = new Date().getFullYear() - dob.getFullYear();
      if (age < 18) {
        newErrors.dob = 'You must be at least 18 years old';
      }
    }

    setErrors(newErrors);
    const isFormValid = Object.keys(newErrors).length === 0;
    setIsValid(isFormValid);
    return isFormValid;
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Title */}
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Confirm Your Details
        </h2>
        <p className="text-muted-foreground">
          Sign in and complete your profile
        </p>
      </div>

      {/* Sign-In Section */}
      {!showForm && (
        <motion.div
          className="bg-card rounded-2xl p-6 card-shadow space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Sign in to confirm your appointment
            </h3>
          </div>

          <GoogleSignInButton onSuccess={handleGoogleSuccess} />

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Mobile Number
            </label>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="px-3 py-3 bg-muted rounded-lg text-foreground font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="10-digit number"
                  value={mobileForOTP}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setMobileForOTP(value);
                    setOtpError('');
                  }}
                  disabled={otpSent || otpLoading}
                  maxLength={10}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-border bg-card text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                />
              </div>
              {!otpSent ? (
                <motion.button
                  onClick={handleSendOTP}
                  disabled={otpLoading || mobileForOTP.length !== 10 || countdown > 0}
                  className="px-6 py-3 rounded-lg bg-primary text-white font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  whileTap={{ scale: 0.95 }}
                >
                  {otpLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : (
                    'Send OTP'
                  )}
                </motion.button>
              ) : null}
            </div>
            {otpError && (
              <p className="text-sm text-red-600 mt-2" role="alert">
                {otpError}
              </p>
            )}
          </div>

          {/* OTP Input Field */}
          {otpSent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              <label className="block text-sm font-medium text-foreground">
                Enter OTP
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="6-digit OTP"
                  value={otpValue}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtpValue(value);
                    setOtpError('');
                  }}
                  maxLength={6}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-border bg-card text-foreground text-center text-xl tracking-widest font-bold placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  autoFocus
                />
                <motion.button
                  onClick={handleVerifyOTP}
                  disabled={otpLoading || otpValue.length !== 6}
                  className="px-6 py-3 rounded-lg font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  style={{
                    backgroundColor: otpValue.length === 6 ? 'var(--brand-teal)' : 'var(--muted)',
                    color: otpValue.length === 6 ? 'white' : 'var(--muted-foreground)',
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {otpLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    'Verify OTP'
                  )}
                </motion.button>
              </div>
              
              {countdown === 0 && (
                <button
                  onClick={handleSendOTP}
                  disabled={otpLoading}
                  className="text-sm text-primary hover:underline focus-visible:outline-none"
                >
                  Didn't receive? Resend OTP
                </button>
              )}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Form Section */}
      {showForm && (
        <motion.div
          className="bg-card rounded-2xl p-6 card-shadow space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Switch to OTP option (for Google OAuth users who want auto-fill) */}
          {!isExistingUser && (
            <div className="flex justify-end mb-2">
              <button
                onClick={() => {
                  // Clear Google session and show OTP flow
                  sessionStorage.removeItem('auth_token');
                  sessionStorage.removeItem('user_info');
                  setShowForm(false);
                  setIsExistingUser(false);
                }}
                className="text-sm text-primary hover:underline focus:outline-none"
              >
                Use OTP Instead →
              </button>
            </div>
          )}

          {/* Welcome message for existing users */}
          {isExistingUser && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                👤 Welcome back! Your details have been auto-filled.
              </p>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={patient.name || ''}
              onChange={(e) => {
                onSetPatient({ name: e.target.value });
              }}
              className="w-full px-4 py-3 rounded-lg border-2 border-border bg-card text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field (Optional for OTP users, required for Google users) */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Email {!patient.email && '(Optional)'}
            </label>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={patient.email || ''}
              onChange={(e) => {
                onSetPatient({ email: e.target.value });
              }}
              readOnly={!!patient.googleId}
              className="w-full px-4 py-3 rounded-lg border-2 border-border bg-card text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 read-only:opacity-50 read-only:cursor-not-allowed"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Mobile Number
            </label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-3 bg-muted rounded-lg text-foreground font-medium">
                +91
              </span>
              <input
                type="tel"
                placeholder="10-digit number"
                value={patient.phone?.replace('+91', '') || ''}
                onChange={handlePhoneChange}
                readOnly={!!sessionStorage.getItem('user_info') && JSON.parse(sessionStorage.getItem('user_info') || '{}').phone}
                maxLength={10}
                className="flex-1 px-4 py-3 rounded-lg border-2 border-border bg-card text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary read-only:opacity-50 read-only:cursor-not-allowed"
              />
              {patient.phone && sessionStorage.getItem('user_info') && JSON.parse(sessionStorage.getItem('user_info') || '{}').phone && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {errors.phone}
              </p>
            )}
          </div>

          {/* DOB Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={patient.dateOfBirth || ''}
              onChange={handleDOBChange}
              className="w-full px-4 py-3 rounded-lg border-2 border-border bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            {errors.dob && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {errors.dob}
              </p>
            )}
          </div>

          {/* Concerns Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Specific Concern (Optional)
            </label>
            <textarea
              placeholder="Tell us about your skin concerns..."
              value={patient.concerns || ''}
              onChange={handleConcernsChange}
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 rounded-lg border-2 border-border bg-card text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
            />
          </div>

          {/* Trust Signals */}
          <div className="pt-4 border-t border-border space-y-2 text-sm text-muted-foreground text-center">
            <p>🔒 Secure & confidential</p>
            <p>📅 Free cancellation up to 24 hours</p>
            <p>✉️ SMS & Email confirmation</p>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <motion.button
          onClick={onBack}
          disabled={isConfirming}
          className="flex-1 py-4 px-6 rounded-xl font-semibold text-lg bg-secondary text-primary border-2 border-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Back
        </motion.button>

        {showForm && (
          <motion.button
            onClick={() => {
              if (validateForm()) {
                onConfirm();
              }
            }}
            disabled={isConfirming || !isValid}
            className="flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isValid ? 'var(--brand-teal)' : 'var(--muted)',
              color: isValid ? 'white' : 'var(--muted-foreground)',
            }}
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
          >
            {isConfirming ? 'Confirming...' : 'Confirm Appointment'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
