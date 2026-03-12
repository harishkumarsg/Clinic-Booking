'use client';

import { CalendarPicker } from '@/components/ui/CalendarPicker';
import { SlotGrid } from '@/components/ui/SlotGrid';
import { generateMockSlots, SERVICES } from '@/lib/data/mockData';
import { TimeSlot, Service } from '@/lib/types/booking';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRef, useEffect } from 'react';

interface Step2DateTimeProps {
  selectedService: Service | null;
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  onSelectService: (service: Service) => void;
  onSelectDate: (date: Date) => void;
  onSelectSlot: (slot: TimeSlot) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function Step2DateTime({
  selectedService,
  selectedDate,
  selectedSlot,
  onSelectService,
  onSelectDate,
  onSelectSlot,
  onContinue,
  onBack,
}: Step2DateTimeProps) {
  const slots = selectedDate ? generateMockSlots(selectedDate) : [];
  const slotsRef = useRef<HTMLDivElement>(null);
  const continueButtonRef = useRef<HTMLDivElement>(null);

  // Auto-select first service if none selected
  useEffect(() => {
    if (!selectedService && SERVICES.length > 0) {
      onSelectService(SERVICES[0]);
    }
  }, [selectedService, onSelectService]);

  // Scroll to slots when date is selected
  useEffect(() => {
    if (selectedDate && slotsRef.current) {
      setTimeout(() => {
        slotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    }
  }, [selectedDate]);

  // Scroll to continue button when slot is selected
  useEffect(() => {
    if (selectedSlot && continueButtonRef.current) {
      setTimeout(() => {
        continueButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 300);
    }
  }, [selectedSlot]);

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
          Book Your Appointment
        </h2>
        <p className="text-muted-foreground">
          Select date and time
        </p>
      </div>

      {/* Layout: Calendar + Slots (side by side on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <CalendarPicker selectedDate={selectedDate} onSelectDate={onSelectDate} />

        {/* Slots or Empty State */}
        <div ref={slotsRef}>
          {selectedDate ? (
            <SlotGrid slots={slots} selectedSlot={selectedSlot} onSelectSlot={onSelectSlot} />
          ) : (
            <motion.div
              className="bg-card rounded-2xl p-6 card-shadow flex items-center justify-center min-h-64"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-muted-foreground text-center">Select a date to see available slots</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div ref={continueButtonRef} className="flex gap-4">
        <motion.button
          onClick={onBack}
          className="flex-1 py-4 px-6 rounded-xl font-semibold text-lg bg-secondary text-primary border-2 border-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Back
        </motion.button>

        <motion.button
          onClick={onContinue}
          disabled={!selectedDate || !selectedSlot}
          className="flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: selectedDate && selectedSlot ? 'var(--brand-teal)' : 'var(--muted)',
            color: selectedDate && selectedSlot ? 'white' : 'var(--muted-foreground)',
          }}
          whileHover={selectedDate && selectedSlot ? { scale: 1.02 } : {}}
          whileTap={selectedDate && selectedSlot ? { scale: 0.98 } : {}}
        >
          Continue
        </motion.button>
      </div>
    </motion.div>
  );
}
