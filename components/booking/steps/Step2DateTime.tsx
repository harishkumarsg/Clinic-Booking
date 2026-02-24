'use client';

import { CalendarPicker } from '@/components/ui/CalendarPicker';
import { SlotGrid } from '@/components/ui/SlotGrid';
import { generateMockSlots, SERVICES } from '@/lib/data/mockData';
import { TimeSlot, Service } from '@/lib/types/booking';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
          Select service, date and time
        </p>
      </div>

      {/* Service Selector */}
      <div className="bg-card rounded-2xl p-6 card-shadow space-y-3">
        <label className="text-sm font-medium text-muted-foreground">
          Select Treatment/Service
        </label>
        <Select
          value={selectedService?.id || ''}
          onValueChange={(value) => {
            const service = SERVICES.find((s) => s.id === value);
            if (service) onSelectService(service);
          }}
        >
          <SelectTrigger className="w-full h-14 text-lg">
            <SelectValue placeholder="Choose a service">
              {selectedService ? (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedService.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold">{selectedService.name}</div>
                    <div className="text-sm text-muted-foreground">
                      From ₹{selectedService.priceFrom} · {selectedService.duration} min
                    </div>
                  </div>
                </div>
              ) : (
                'Choose a service'
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SERVICES.map((service) => (
              <SelectItem key={service.id} value={service.id} className="h-16">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{service.icon}</span>
                  <div>
                    <div className="font-semibold">
                      {service.name}
                      {service.popular && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      From ₹{service.priceFrom} · {service.duration} min
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Layout: Calendar + Slots (side by side on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <CalendarPicker selectedDate={selectedDate} onSelectDate={onSelectDate} />

        {/* Slots or Empty State */}
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

      {/* Action Buttons */}
      <div className="flex gap-4">
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
          disabled={!selectedService || !selectedDate || !selectedSlot}
          className="flex-1 py-4 px-6 rounded-xl font-semibold text-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: selectedService && selectedDate && selectedSlot ? 'var(--brand-teal)' : 'var(--muted)',
            color: selectedService && selectedDate && selectedSlot ? 'white' : 'var(--muted-foreground)',
          }}
          whileHover={selectedService && selectedDate && selectedSlot ? { scale: 1.02 } : {}}
          whileTap={selectedService && selectedDate && selectedSlot ? { scale: 0.98 } : {}}
        >
          Continue
        </motion.button>
      </div>
    </motion.div>
  );
}
