'use client';

import { Service } from '@/lib/types/booking';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ServiceCardProps {
  service: Service;
  isSelected?: boolean;
  onSelect?: (service: Service) => void;
}

export function ServiceCard({ service, isSelected = false, onSelect }: ServiceCardProps) {
  return (
    <motion.button
      onClick={() => onSelect?.(service)}
      className={`relative w-full p-4 rounded-2xl text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        isSelected
          ? 'bg-secondary border-2 border-primary'
          : 'bg-card border-2 border-transparent hover:border-primary hover:shadow-lg'
      }`}
      whileHover={{ scale: 1.02, translateY: -2 }}
      whileTap={{ scale: 0.98 }}
      aria-pressed={isSelected}
      aria-label={`${service.name} service`}
    >
      {/* Popular Badge */}
      {service.popular && (
        <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-semibold">
          Popular
        </div>
      )}

      {/* Icon & Name */}
      <div className="flex items-start gap-3 mb-2">
        <span className="text-3xl mt-1">{service.icon}</span>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{service.name}</h3>
          {service.popular && (
            <p className="text-xs text-accent font-medium mt-1">Most popular</p>
          )}
        </div>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-0.5"
          >
            <Check className="w-4 h-4" />
          </motion.div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
        {service.description}
      </p>

      {/* Details Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-sm font-medium text-foreground">
          From <span className="text-primary font-semibold">₹{service.priceFrom}</span>
        </span>
        <span className="text-xs text-muted-foreground">{service.duration} min</span>
      </div>
    </motion.button>
  );
}
