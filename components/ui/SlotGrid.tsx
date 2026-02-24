'use client';

import { TimeSlot } from '@/lib/types/booking';
import { motion } from 'framer-motion';
import { SlotButton } from './SlotButton';
import { useState, useEffect } from 'react';

interface SlotGridProps {
  slots: TimeSlot[];
  selectedSlot?: TimeSlot | null;
  onSelectSlot?: (slot: TimeSlot) => void;
}

const PERIOD_ICONS = {
  morning: '🌅',
  afternoon: '🌤️',
  evening: '🌙',
};

const PERIOD_LABELS = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
};

export function SlotGrid({ slots, selectedSlot, onSelectSlot }: SlotGridProps) {
  const [countdown, setCountdown] = useState<string>('');

  // Countdown timer for slot hold
  useEffect(() => {
    if (!selectedSlot) return;

    const timer = setInterval(() => {
      const now = new Date();
      const minutes = 15;
      const seconds = Math.floor((minutes * 60) / 1000);
      const displaySeconds = seconds % 60;
      const displayMinutes = Math.floor(seconds / 60);

      setCountdown(`${String(displayMinutes).padStart(2, '0')}:${String(displaySeconds).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedSlot]);

  const groupedSlots = {
    morning: slots.filter((s) => s.period === 'morning'),
    afternoon: slots.filter((s) => s.period === 'afternoon'),
    evening: slots.filter((s) => s.period === 'evening'),
  };

  const renderPeriodGroup = (period: 'morning' | 'afternoon' | 'evening') => {
    const periodSlots = groupedSlots[period];
    if (periodSlots.length === 0) return null;

    return (
      <motion.div
        key={period}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        {/* Period Header */}
        <div className="flex items-center gap-2">
          <span className="text-xl">{PERIOD_ICONS[period]}</span>
          <h4 className="text-sm font-semibold text-foreground">{PERIOD_LABELS[period]}</h4>
          <span className="text-xs text-muted-foreground ml-auto">
            {periodSlots.filter((s) => s.available).length} available
          </span>
        </div>

        {/* Slots Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {periodSlots.map((slot) => (
            <SlotButton
              key={slot.id}
              slot={slot}
              isSelected={selectedSlot?.id === slot.id}
              onSelect={onSelectSlot}
            />
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      className="bg-card rounded-2xl p-6 card-shadow space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Live Update Indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
        <span>Updating live availability</span>
      </div>

      {/* Period Groups */}
      <div className="space-y-6">
        {renderPeriodGroup('morning')}
        {renderPeriodGroup('afternoon')}
        {renderPeriodGroup('evening')}
      </div>

      {/* Countdown Timer */}
      {selectedSlot && (
        <motion.div
          className="pt-4 border-t border-border text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-xs text-accent font-medium">
            Slot held for{' '}
            <span className="inline-block w-12 font-mono font-semibold">{countdown}</span>
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
