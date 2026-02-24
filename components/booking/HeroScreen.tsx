'use client';

import { Doctor } from '@/lib/types/booking';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface HeroScreenProps {
  doctor: Doctor;
  onStart: () => void;
}

export function HeroScreen({ doctor, onStart }: HeroScreenProps) {
  return (
    <motion.div
      className="space-y-6 text-center max-w-2xl mx-auto py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Doctor Photo */}
      <motion.div
        className="relative w-24 h-24 rounded-full overflow-hidden mx-auto ring-4 ring-primary/20"
        whileHover={{ scale: 1.1 }}
      >
        <Image src={doctor.photo} alt={doctor.name} fill className="object-cover" />
      </motion.div>

      {/* Doctor Name & Title */}
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          {doctor.name}, MD
        </h1>
        <p className="text-xl text-primary font-medium">{doctor.title}</p>
      </div>

      {/* Experience & Rating */}
      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-4 text-muted-foreground text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span>{doctor.experience} Experience</span>
        <span className="hidden sm:inline text-border">•</span>
        <div className="flex items-center gap-1">
          <div className="flex">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-accent text-accent"
                  size={16}
                />
              ))}
          </div>
          <span className="ml-1">
            {doctor.rating} ({doctor.reviews.toLocaleString()} reviews)
          </span>
        </div>
        <span className="hidden sm:inline text-border">•</span>
        <span>📍 {doctor.location}</span>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        onClick={onStart}
        className="w-full md:w-auto px-12 py-4 bg-primary text-white rounded-2xl font-semibold text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
        whileHover={{ scale: 1.05, boxShadow: '0 8px 32px rgba(13, 115, 119, 0.3)' }}
        whileTap={{ scale: 0.98 }}
      >
        Book an Appointment — Free
      </motion.button>

      {/* Trust Badge */}
      <motion.div
        className="inline-block bg-secondary rounded-full px-6 py-3 text-sm font-medium text-primary"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        🔒 Free cancellation up to 24 hours
      </motion.div>

      {/* Specialization */}
      <p className="text-base text-muted-foreground mt-8">
        {doctor.specialization}
      </p>
    </motion.div>
  );
}
