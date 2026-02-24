'use client';

import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  count?: number;
  height?: string;
  width?: string;
  circle?: boolean;
}

export function SkeletonLoader({
  count = 1,
  height = 'h-6',
  width = 'w-full',
  circle = false,
}: SkeletonLoaderProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`${width} ${height} ${circle ? 'rounded-full' : 'rounded-lg'} bg-muted`}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
