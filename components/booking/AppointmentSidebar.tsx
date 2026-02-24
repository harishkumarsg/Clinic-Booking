'use client';

import { Doctor, Service, TimeSlot } from '@/lib/types/booking';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Clock, CreditCard } from 'lucide-react';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

interface AppointmentSidebarProps {
  doctor: Doctor;
  service: Service | null;
  date: Date | null;
  slot: TimeSlot | null;
}

export function AppointmentSidebar({ doctor, service, date, slot }: AppointmentSidebarProps) {
  const formatDate = (d: Date) => d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatTime = (s: TimeSlot) => s.time;

  return (
    <motion.div
      className="hidden lg:block sticky top-6 bg-secondary rounded-2xl p-6 card-shadow h-fit"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-lg font-bold text-foreground mb-6">YOUR APPOINTMENT</h3>

      <div className="space-y-4">
        {/* Doctor */}
        <motion.div className="flex items-start gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <Image src={doctor.photo} alt={doctor.name} fill className="object-cover" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Doctor</p>
            <p className="font-semibold text-foreground">{doctor.name}</p>
            <p className="text-xs text-muted-foreground">{doctor.title}</p>
          </div>
        </motion.div>

        {/* Service */}
        <motion.div
          className="pt-4 border-t border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <p className="text-xs text-muted-foreground mb-2">Service</p>
          {service ? (
            <p className="font-semibold text-foreground">{service.name}</p>
          ) : (
            <SkeletonLoader height="h-4" width="w-24" />
          )}
        </motion.div>

        {/* Date & Time */}
        <motion.div
          className="pt-4 border-t border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-muted-foreground mb-2">Date & Time</p>
          {date && slot ? (
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{formatDate(date)}</p>
              <p className="text-sm text-primary font-medium">{formatTime(slot)}</p>
            </div>
          ) : (
            <SkeletonLoader height="h-4" width="w-32" count={2} />
          )}
        </motion.div>

        {/* Location */}
        <motion.div
          className="pt-4 border-t border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="font-semibold text-foreground text-sm">{doctor.location}</p>
            </div>
          </div>
        </motion.div>

        {/* Fee */}
        <motion.div
          className="pt-4 border-t border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start gap-2">
            <CreditCard className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Consultation Fee</p>
              {service ? (
                <p className="font-semibold text-foreground text-sm">From ₹{service.priceFrom}</p>
              ) : (
                <SkeletonLoader height="h-4" width="w-20" />
              )}
            </div>
          </div>
        </motion.div>

        {/* Free Cancellation */}
        <motion.div
          className="pt-4 border-t border-border bg-primary/5 rounded-lg p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <p className="text-xs text-primary font-medium">✓ Free cancellation until 24 hours before</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
