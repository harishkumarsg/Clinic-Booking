'use client';

import { Doctor, Service, TimeSlot } from '@/lib/types/booking';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface MobileSummaryBarProps {
  doctor: Doctor;
  service: Service | null;
  date: Date | null;
  slot: TimeSlot | null;
}

export function MobileSummaryBar({ doctor, service, date, slot }: MobileSummaryBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (d: Date) => d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

  return (
    <motion.div
      className="lg:hidden fixed bottom-0 left-0 right-0 bg-secondary border-t-2 border-border z-40"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
    >
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden">
            <Image src={doctor.photo} alt={doctor.name} fill className="object-cover" />
          </div>
          <div className="text-left">
            <p className="text-xs text-muted-foreground">Your Appointment</p>
            <p className="text-sm font-semibold text-foreground">
              {service ? service.name.slice(0, 20) : 'Select service'}
            </p>
          </div>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
          <ChevronUp className="w-5 h-5 text-primary" />
        </motion.div>
      </motion.button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="bg-secondary px-4 pb-4 space-y-3 border-t border-border"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Service */}
            {service && (
              <div>
                <p className="text-xs text-muted-foreground">Service</p>
                <p className="text-sm font-semibold text-foreground">{service.name}</p>
              </div>
            )}

            {/* Date & Time */}
            {date && slot && (
              <div>
                <p className="text-xs text-muted-foreground">Date & Time</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatDate(date)} at {slot.time}
                </p>
              </div>
            )}

            {/* Doctor & Location */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Doctor</p>
              <p className="text-sm font-semibold text-foreground">{doctor.name}</p>
              <p className="text-xs text-muted-foreground">{doctor.location}</p>
            </div>

            {/* Fee */}
            {service && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">Fee</p>
                <p className="text-sm font-semibold text-primary">From ₹{service.priceFrom}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for bottom fixed position */}
      <div className="h-20" />
    </motion.div>
  );
}
