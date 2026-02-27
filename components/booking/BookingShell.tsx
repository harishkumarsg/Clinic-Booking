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
import { ConfirmationScreen } from './ConfirmationScreen';
import { AppointmentSidebar } from './AppointmentSidebar';
import { MobileSummaryBar } from './MobileSummaryBar';

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
      // Confirmation step
      setIsConfirming(true);
      try {
        await booking.confirmBooking();
      } catch (error) {
        console.error('Failed to confirm booking:', error);
      } finally {
        setIsConfirming(false);
      }
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
            isConfirming={isConfirming}
          />
        );
      case 3:
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 max-w-7xl mx-auto px-4 py-8">
          {/* Left: Main Booking Flow */}
          <div className="space-y-6">
            {/* Step Progress - Show on steps 1-2 only */}
            {booking.state.currentStep > 0 && booking.state.currentStep < 3 && (
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

          {/* Right: Sidebar */}
          <AppointmentSidebar
            doctor={DOCTOR}
            service={booking.state.selectedService}
            date={booking.state.selectedDate}
            slot={booking.state.selectedSlot}
          />
        </div>

        {/* Mobile Summary Bar */}
        {booking.state.currentStep > 0 && booking.state.currentStep < 4 && (
          <MobileSummaryBar
            doctor={DOCTOR}
            service={booking.state.selectedService}
            date={booking.state.selectedDate}
            slot={booking.state.selectedSlot}
          />
        )}

        {/* Mobile bottom padding for fixed summary bar */}
        {booking.state.currentStep > 0 && booking.state.currentStep < 4 && (
          <div className="lg:hidden h-24" />
        )}
      </div>
    </BookingContext.Provider>
  );
}
