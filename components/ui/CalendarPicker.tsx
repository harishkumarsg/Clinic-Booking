'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAvailableSlotsCount, isDateAvailable } from '@/lib/data/mockData';

interface CalendarPickerProps {
  selectedDate?: Date | null;
  onSelectDate?: (date: Date) => void;
}

export function CalendarPicker({ selectedDate, onSelectDate }: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthName = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
  const days: (number | null)[] = Array(firstDayOfMonth).fill(null);

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleDayClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (isDateAvailable(date)) {
      onSelectDate?.(date);
    }
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  return (
    <motion.div
      className="bg-card rounded-2xl p-6 card-shadow"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">{monthName}</h3>
        <div className="flex gap-2">
          <motion.button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-secondary rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            whileTap={{ scale: 0.95 }}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </motion.button>
          <motion.button
            onClick={handleNextMonth}
            className="p-2 hover:bg-secondary rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            whileTap={{ scale: 0.95 }}
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </motion.button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />;
          }

          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const available = isDateAvailable(date);
          const selected = isDateSelected(day);
          const availableSlots = available ? getAvailableSlotsCount(date) : 0;
          const isLimited = availableSlots > 0 && availableSlots <= 2;

          return (
            <motion.button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={!available}
              className={`relative p-2 rounded-lg font-medium text-sm transition-all ${
                selected
                  ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : available
                    ? 'hover:bg-secondary text-foreground cursor-pointer'
                    : 'text-muted-foreground bg-muted cursor-not-allowed'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
              whileHover={available ? { scale: 1.05 } : {}}
              whileTap={available ? { scale: 0.95 } : {}}
              aria-label={`${day} ${monthName}${available ? '' : ' (unavailable)'}`}
            >
              {day}
              {isLimited && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground text-center">
        Closed on Sundays
      </div>
    </motion.div>
  );
}
