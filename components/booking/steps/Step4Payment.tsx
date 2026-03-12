'use client';

import { motion } from 'framer-motion';
import { IndianRupee, Check } from 'lucide-react';
import { useState } from 'react';

interface Step4PaymentProps {
  consultationFee: number;
  onPaymentComplete: (paymentId: string, amount: number) => void;
  onBack: () => void;
  isProcessing?: boolean;
}

export function Step4Payment({
  consultationFee,
  onPaymentComplete,
  onBack,
  isProcessing = false,
}: Step4PaymentProps) {
  const [selectedOption, setSelectedOption] = useState<'partial' | 'full' | null>(null);
  const bookingFee = 50;

  // Check if Razorpay is configured
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const isDevMode = !razorpayKey || razorpayKey === 'your_razorpay_key_id_here' || razorpayKey === 'rzp_test_dummy';

  const handlePayment = async (amount: number, type: 'partial' | 'full') => {
    setSelectedOption(type);

    // Development mode - skip actual payment
    if (isDevMode) {
      console.log('🔧 Dev Mode: Simulating payment...');
      console.log(`Amount: ₹${amount}, Type: ${type}`);
      
      // Simulate payment success after 1 second
      setTimeout(() => {
        const mockPaymentId = `pay_dev_${Date.now()}`;
        console.log('✅ Dev Mode: Payment successful!', mockPaymentId);
        onPaymentComplete(mockPaymentId, amount);
      }, 1000);
      return;
    }

    // Production mode - use Razorpay
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const options = {
        key: razorpayKey,
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        name: "Dr. Sindhu's Skin Clinic",
        description: type === 'partial' ? 'Booking Fee' : 'Full Consultation Payment',
        image: '/logo.png',
        handler: function (response: any) {
          // Payment successful
          onPaymentComplete(response.razorpay_payment_id, amount);
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#14b8a6',
        },
        modal: {
          ondismiss: function () {
            setSelectedOption(null);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    };
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
          Complete Payment
        </h2>
        <p className="text-muted-foreground">
          Choose your payment option to confirm your appointment
        </p>
        {isDevMode && (
          <div className="mt-3 px-4 py-2 bg-yellow-100 border border-yellow-300 rounded-lg text-sm text-yellow-800">
            ⚠️ <strong>Development Mode:</strong> Payment will be simulated (no actual charge)
          </div>
        )}
      </div>

      {/* Payment Options */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Pay Booking Fee */}
        <motion.button
          onClick={() => handlePayment(bookingFee, 'partial')}
          disabled={isProcessing}
          className="relative bg-card rounded-2xl p-6 card-shadow hover:shadow-lg transition-all text-left border-2 border-border hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isProcessing ? 1 : 1.02 }}
          whileTap={{ scale: isProcessing ? 1 : 0.98 }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Pay Booking Fee</h3>
                <p className="text-sm text-muted-foreground">Pay remaining at clinic</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold" style={{ color: 'var(--brand-teal)' }}>
                ₹{bookingFee}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-600" />
                <span>Confirm your appointment instantly</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-600" />
                <span>Pay ₹{consultationFee - bookingFee} at the clinic</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-600" />
                <span>Flexible payment option</span>
              </div>
            </div>
          </div>

          {selectedOption === 'partial' && (
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-pulse">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
        </motion.button>

        {/* Pay Full Amount */}
        <motion.button
          onClick={() => handlePayment(consultationFee, 'full')}
          disabled={isProcessing}
          className="relative bg-card rounded-2xl p-6 card-shadow hover:shadow-lg transition-all text-left border-2 border-primary disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isProcessing ? 1 : 1.02 }}
          whileTap={{ scale: isProcessing ? 1 : 0.98 }}
        >
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white">
              RECOMMENDED
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--brand-teal)' }}>
                <IndianRupee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Pay Full Amount</h3>
                <p className="text-sm text-muted-foreground">Complete payment now</p>
              </div>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold" style={{ color: 'var(--brand-teal)' }}>
                ₹{consultationFee}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-600" />
                <span>No payment at clinic</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-600" />
                <span>Hassle-free check-in</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-600" />
                <span>Secure online payment</span>
              </div>
            </div>
          </div>

          {selectedOption === 'full' && (
            <div className="absolute top-4 right-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-pulse">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
        </motion.button>
      </div>

      {/* Security Badge */}
      <div className="bg-muted/50 rounded-xl p-4 text-center text-sm text-muted-foreground">
        {isDevMode ? (
          <p>🔧 Development Mode: Payments are simulated • Configure Razorpay keys in .env for live payments</p>
        ) : (
          <p>🔒 Secure payment powered by Razorpay • All transactions are encrypted</p>
        )}
      </div>

      {/* Back Button */}
      <div className="flex gap-4">
        <motion.button
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1 py-4 px-6 rounded-xl font-semibold text-lg bg-secondary text-primary border-2 border-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Back
        </motion.button>
      </div>
    </motion.div>
  );
}
