'use client';

import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface StepProgressProps {
  currentStep: number;
  steps?: string[];
  totalSteps?: number;
}

export function StepProgress({
  currentStep,
  steps = ['Date & Time', 'Confirm', 'Payment'],
  totalSteps = 3,
}: StepProgressProps) {
  return (
    <div className="flex items-center justify-between gap-2 md:gap-4">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep + 1;
        const isCompleted = stepNumber < currentStep + 1;

        return (
          <div key={index} className="flex items-center flex-1">
            {/* Step Indicator */}
            <motion.div
              className={`relative flex items-center justify-center w-10 h-10 rounded-full font-medium text-sm transition-all ${
                isActive
                  ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-background'
                  : isCompleted
                    ? 'bg-secondary text-primary'
                    : 'bg-muted text-muted-foreground border-2 border-border'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{stepNumber}</span>
              )}
            </motion.div>

            {/* Connector Line */}
            {index < totalSteps - 1 && (
              <motion.div
                className={`flex-1 h-1 mx-2 rounded transition-colors ${
                  isCompleted ? 'bg-primary' : 'bg-border'
                }`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: index * 0.1 + 0.1 }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
