'use client';

import { TimeSlot } from '@/lib/types/booking';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface SlotButtonProps {
  slot: TimeSlot;
  isSelected?: boolean;
  onSelect?: (slot: TimeSlot) => void;
}

export function SlotButton({ slot, isSelected = false, onSelect }: SlotButtonProps) {
  const isBooked = !slot.available;

  return (
    <motion.button
      onClick={() => !isBooked && onSelect?.(slot)}
      disabled={isBooked}
      className={`relative px-4 py-3 rounded-lg font-medium text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        isSelected
          ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-background'
          : isBooked
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
      }`}
      whileTap={!isBooked ? { scale: 0.95 } : {}}
      whileHover={!isBooked && !isSelected ? { scale: 1.05 } : {}}
      aria-pressed={isSelected}
      aria-disabled={isBooked}
      aria-label={`${slot.time} ${isBooked ? 'not available' : 'available'}${isSelected ? ' selected' : ''}`}
    >
      {/* Limited Badge */}
      {!isBooked && slot.available && (
        <span className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full" />
      )}

      <div className="flex items-center justify-center gap-2">
        <span className={isBooked ? 'line-through' : ''}>{slot.time}</span>
        {isSelected && <Check className="w-4 h-4" />}
      </div>
    </motion.button>
  );
}
