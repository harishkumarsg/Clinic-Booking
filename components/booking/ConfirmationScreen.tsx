'use client';

import { Doctor, Service, TimeSlot, PatientInfo } from '@/lib/types/booking';
import { motion } from 'framer-motion';
import { Check, Calendar, Share2 } from 'lucide-react';

interface ConfirmationScreenProps {
  doctor: Doctor;
  service: Service | null;
  date: Date | null;
  slot: TimeSlot | null;
  patient: Partial<PatientInfo>;
  bookingId: string | null;
  onNewBooking: () => void;
}

export function ConfirmationScreen({
  doctor,
  service,
  date,
  slot,
  patient,
  bookingId,
  onNewBooking,
}: ConfirmationScreenProps) {
  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-IN', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

  // Confetti animation component
  const Confetti = () => {
    const confetti = Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="fixed w-2 h-2 rounded-full"
        style={{
          backgroundColor:
            i % 2 === 0 ? 'var(--brand-teal)' : 'var(--brand-amber)',
          left: `${Math.random() * 100}%`,
          top: '-10px',
        }}
        animate={{
          y: window.innerHeight + 10,
          opacity: [1, 0],
        }}
        transition={{
          duration: 2 + Math.random() * 1,
          delay: Math.random() * 0.3,
        }}
      />
    ));
    return <>{confetti}</>;
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center py-8 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Confetti */}
      <Confetti />

      {/* Main Content */}
      <motion.div
        className="w-full max-w-2xl text-center space-y-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.5,
          delay: 0.2,
        }}
      >
        {/* Checkmark Animation */}
        <motion.div
          className="flex justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 10,
            delay: 0.3,
          }}
        >
          <div className="relative w-24 h-24 bg-success/10 rounded-full flex items-center justify-center">
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Check className="w-12 h-12 text-success" strokeWidth={1} />
            </motion.div>
          </div>
        </motion.div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            You're all set, {patient.name?.split(' ')[0]}! 🎉
          </h1>
          <p className="text-lg text-muted-foreground">Your appointment is confirmed</p>
        </div>

        {/* Summary Card */}
        <motion.div
          className="bg-card rounded-2xl p-6 md:p-8 card-shadow space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="space-y-4">
            {/* Doctor */}
            <div className="pb-4 border-b border-border text-left">
              <p className="text-xs text-muted-foreground mb-1">Doctor</p>
              <p className="text-lg font-semibold text-foreground">{doctor.name}</p>
              <p className="text-sm text-muted-foreground">{doctor.title}</p>
            </div>

            {/* Service */}
            {service && (
              <div className="pb-4 border-b border-border text-left">
                <p className="text-xs text-muted-foreground mb-1">Service</p>
                <p className="text-lg font-semibold text-foreground">{service.name}</p>
              </div>
            )}

            {/* Date & Time */}
            {date && slot && (
              <div className="pb-4 border-b border-border text-left">
                <p className="text-xs text-muted-foreground mb-1">Date & Time</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatDate(date)} at {slot.time}
                </p>
              </div>
            )}

            {/* Location */}
            <div className="text-left">
              <p className="text-xs text-muted-foreground mb-1">Location</p>
              <p className="text-lg font-semibold text-foreground">{doctor.location}</p>
            </div>
          </div>
        </motion.div>

        {/* Booking ID */}
        {bookingId && (
          <motion.p
            className="text-sm text-muted-foreground font-mono"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Booking ID: <span className="font-semibold text-foreground">{bookingId}</span>
          </motion.p>
        )}

        {/* Confirmation Message */}
        <motion.div
          className="bg-secondary rounded-xl p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          <p className="text-sm text-foreground">
            📩 Confirmation sent to <span className="font-semibold">{patient.email}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            📱 SMS confirmation sent to {patient.phone}
          </p>
        </motion.div>

        {/* Important Info */}
        <motion.div
          className="text-sm text-muted-foreground space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p>⏰ Please arrive 15 minutes early</p>
          <p>✓ Bring a valid ID and any medical reports</p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 pt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <motion.button
            onClick={() => {
              // Add to calendar logic
              const isoDate = date?.toISOString().split('T')[0];
              const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(service?.name || 'Appointment with ' + doctor.name)}&dates=${isoDate}T${slot?.time.replace(':', '')}00/${isoDate}T${slot?.time.replace(':', '')}59&details=${encodeURIComponent(`Appointment with ${doctor.name}\nLocation: ${doctor.location}`)}&location=${encodeURIComponent(doctor.location)}`;
              window.open(calendarUrl, '_blank');
            }}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Calendar className="w-4 h-4" />
            Add to Calendar
          </motion.button>

          <motion.button
            onClick={() => {
              const text = `I've booked an appointment with ${doctor.name} on ${formatDate(date!)} at ${slot?.time}. Join me on WhatsApp! 👍`;
              const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
              window.open(whatsappUrl, '_blank');
            }}
            className="flex-1 px-6 py-3 bg-secondary text-primary border-2 border-primary rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Share2 className="w-4 h-4" />
            Share via WhatsApp
          </motion.button>
        </motion.div>

        {/* New Booking Button */}
        <motion.button
          onClick={onNewBooking}
          className="w-full px-6 py-3 bg-card border-2 border-primary text-primary rounded-xl font-semibold hover:bg-secondary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Book Another Appointment
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
