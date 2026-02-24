'use client';

import { Doctor } from '@/lib/types/booking';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface DoctorChipProps {
  doctor: Doctor;
}

export function DoctorChip({ doctor }: DoctorChipProps) {
  return (
    <motion.div
      className="flex items-center gap-3 bg-secondary rounded-full px-4 py-2 w-fit"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="relative w-10 h-10 rounded-full overflow-hidden">
        <Image
          src={doctor.photo}
          alt={doctor.name}
          fill
          className="object-cover"
        />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Your doctor</p>
        <p className="text-sm font-semibold text-foreground">{doctor.name}</p>
      </div>
    </motion.div>
  );
}
