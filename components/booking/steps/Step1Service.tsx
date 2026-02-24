'use client';

import { SERVICES, DOCTOR } from '@/lib/data/mockData';
import { Service } from '@/lib/types/booking';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { DoctorChip } from '@/components/ui/DoctorChip';
import { motion } from 'framer-motion';

interface Step1ServiceProps {
  selectedService: Service | null;
  onSelectService: (service: Service) => void;
  onContinue: () => void;
}

export function Step1Service({
  selectedService,
  onSelectService,
  onContinue,
}: Step1ServiceProps) {
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
          Choose Your Service
        </h2>
        <p className="text-muted-foreground">
          Select the treatment or consultation you need
        </p>
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SERVICES.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={selectedService?.id === service.id}
            onSelect={onSelectService}
          />
        ))}
      </div>

      {/* Doctor Chip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <DoctorChip doctor={DOCTOR} />
      </motion.div>

      {/* Continue Button */}
      <motion.button
        onClick={onContinue}
        disabled={!selectedService}
        className="w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: selectedService ? 'var(--brand-teal)' : 'var(--muted)',
          color: selectedService ? 'white' : 'var(--muted-foreground)',
        }}
        whileHover={selectedService ? { scale: 1.02 } : {}}
        whileTap={selectedService ? { scale: 0.98 } : {}}
        aria-label={selectedService ? 'Continue to date selection' : 'Select a service to continue'}
      >
        Continue
      </motion.button>
    </motion.div>
  );
}
