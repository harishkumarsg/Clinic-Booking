'use client';

import { useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useBookingState, BookingContext } from '@/hooks/useBookingState';
import { DOCTOR } from '@/lib/data/mockData';
import { StepProgress } from '@/components/ui/StepProgress';
import { Header } from '@/components/ui/Header';
import { HeroScreen } from './HeroScreen';
import { Step1Service } from './steps/Step1Service';
import { Step2DateTime } from './steps/Step2DateTime';
import { Step3Confirm } from './steps/Step3Confirm';
import { Step4Payment } from './steps/Step4Payment';
import { ConfirmationScreen } from './ConfirmationScreen';

interface BookingShellProps {
  children?: ReactNode;
}

export function BookingShell({ children }: BookingShellProps) {
  const booking = useBookingState();
  const [isConfirming, setIsConfirming] = useState(false);

  const handleContinue = async () => {
    if (booking.state.currentStep === 0) {
      booking.nextStep();
    } else if (booking.state.currentStep === 1) {
      // Date/Time step (with integrated service selector)
      if (booking.state.selectedService && booking.state.selectedDate && booking.state.selectedSlot) {
        booking.nextStep();
      }
    } else if (booking.state.currentStep === 2) {
      // Patient details confirmed, move to payment
      booking.nextStep();
    }
  };

  const handlePaymentComplete = async (paymentId: string, amount: number, type: 'partial' | 'full') => {
    // Set payment info
    booking.setPayment({
      paymentId,
      amount,
      type,
      status: 'completed',
    });

    // Now confirm the booking with the backend
    setIsConfirming(true);
    try {
      await booking.confirmBooking();
    } catch (error) {
      console.error('Failed to confirm booking:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleBack = () => {
    if (booking.state.currentStep > 1) {
      booking.prevStep();
    } else if (booking.state.currentStep === 1) {
      booking.prevStep(); // Back to hero
    }
  };

  const renderContent = () => {
    const { currentStep } = booking.state;

    switch (currentStep) {
      case 0:
        return (
          <HeroScreen
            doctor={DOCTOR}
            onStart={() => booking.nextStep()}
          />
        );
      case 1:
        return (
          <Step2DateTime
            selectedService={booking.state.selectedService}
            selectedDate={booking.state.selectedDate}
            selectedSlot={booking.state.selectedSlot}
            onSelectService={booking.setService}
            onSelectDate={booking.setDate}
            onSelectSlot={booking.setSlot}
            onContinue={handleContinue}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <Step3Confirm
            patient={booking.state.patient}
            onSetPatient={booking.setPatient}
            onConfirm={handleContinue}
            onBack={handleBack}
            isConfirming={false}
          />
        );
      case 3:
        return (
          <Step4Payment
            consultationFee={booking.state.selectedService?.priceFrom || 500}
            onPaymentComplete={(paymentId, amount) => {
              const type = amount === 50 ? 'partial' : 'full';
              handlePaymentComplete(paymentId, amount, type);
            }}
            onBack={handleBack}
            isProcessing={isConfirming}
          />
        );
      case 4:
        return (
          <ConfirmationScreen
            doctor={DOCTOR}
            service={booking.state.selectedService}
            date={booking.state.selectedDate}
            slot={booking.state.selectedSlot}
            patient={booking.state.patient}
            bookingId={booking.state.bookingId}
            onNewBooking={booking.reset}
          />
        );
      default:
        return null;
    }
  };

  return (
    <BookingContext.Provider value={booking}>
      <div className="min-h-screen bg-background">
        {/* Header with Logo */}
        <Header />
        
        {/* Main Content Area */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Left: Main Booking Flow */}
          <div className="space-y-6">
            {/* Step Progress - Show on steps 1-3 only */}
            {booking.state.currentStep > 0 && booking.state.currentStep < 4 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-4 card-shadow"
              >
                <StepProgress currentStep={booking.state.currentStep} />
              </motion.div>
            )}

            {/* Content with Animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={booking.state.currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>

            {children}
          </div>
        </div>
      </div>
    </BookingContext.Provider>
  );
}
