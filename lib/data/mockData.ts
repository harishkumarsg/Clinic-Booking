/**
 * Dr. Sindhu's Booking System - Mock Data
 */

import { Doctor, Service, TimeSlot } from '@/lib/types/booking';

export const DOCTOR: Doctor = {
  id: 'dr-sindhu-001',
  name: 'Dr. Sindhu Ragavi',
  title: 'Consultant Dermatologist',
  experience: '12+ Years',
  rating: 4.9,
  reviews: 847,
  photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  location: 'Velachery, Chennai',
  specialization: 'Medical & Cosmetic Dermatology',
};

export const SERVICES: Service[] = [
  {
    id: 'service-001',
    name: 'Acne Treatment',
    description: 'Professional acne management and skincare',
    duration: 45,
    priceFrom: 500,
    icon: '💊',
    popular: true,
  },
  {
    id: 'service-002',
    name: 'Anti-Aging & Wrinkles',
    description: 'Advanced treatments for fine lines and wrinkles',
    duration: 60,
    priceFrom: 1500,
    icon: '✨',
    popular: true,
  },
  {
    id: 'service-003',
    name: 'Skin Pigmentation',
    description: 'Treatment for dark spots, melasma, and hyperpigmentation',
    duration: 45,
    priceFrom: 1000,
    icon: '🎨',
    popular: false,
  },
  {
    id: 'service-004',
    name: 'Laser Hair Removal',
    description: 'Permanent hair reduction with advanced laser technology',
    duration: 30,
    priceFrom: 2000,
    icon: '✂️',
    popular: true,
  },
  {
    id: 'service-005',
    name: 'Chemical Peels',
    description: 'Deep exfoliation for rejuvenated, glowing skin',
    duration: 40,
    priceFrom: 1200,
    icon: '🧴',
    popular: false,
  },
  {
    id: 'service-006',
    name: 'General Consultation',
    description: 'Initial consultation for skin concerns',
    duration: 30,
    priceFrom: 300,
    icon: '👨‍⚕️',
    popular: false,
  },
];

/**
 * Generate mock time slots for a given date
 * - Sundays: no slots (closed)
 * - Morning: 09:00, 09:30, 10:00, 10:30, 11:00
 * - Afternoon: 12:20, 12:40, 13:00, 14:30, 15:50
 * - Evening: 16:10, 17:00, 18:00
 * - ~30% randomly marked as booked
 */
export function generateMockSlots(date: Date): TimeSlot[] {
  const dayOfWeek = date.getDay();
  
  // Closed on Sundays
  if (dayOfWeek === 0) {
    return [];
  }

  const morningTimes = ['09:00', '09:30', '10:00', '10:30', '11:00'];
  const afternoonTimes = ['12:20', '12:40', '13:00', '14:30', '15:50'];
  const eveningTimes = ['16:10', '17:00', '18:00'];

  const allTimes = [...morningTimes, ...afternoonTimes, ...eveningTimes];

  return allTimes.map((time, index) => {
    const period =
      morningTimes.includes(time)
        ? 'morning'
        : afternoonTimes.includes(time)
          ? 'afternoon'
          : 'evening';

    // Randomly mark ~30% as booked
    const isBooked = Math.random() < 0.3;

    return {
      id: `slot-${date.toISOString()}-${index}`,
      time,
      available: !isBooked,
      period,
    };
  });
}

/**
 * Check if a date is available for booking
 * - No Sundays (closed)
 * - No past dates
 */
export function isDateAvailable(date: Date): boolean {
  const dayOfWeek = date.getDay();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // No Sundays
  if (dayOfWeek === 0) {
    return false;
  }

  // No past dates
  if (date < today) {
    return false;
  }

  return true;
}

/**
 * Get available slots count for a date
 */
export function getAvailableSlotsCount(date: Date): number {
  const slots = generateMockSlots(date);
  return slots.filter((slot) => slot.available).length;
}

/**
 * Get slots grouped by period
 */
export function getSlotsByPeriod(date: Date): Record<string, TimeSlot[]> {
  const slots = generateMockSlots(date);
  return {
    morning: slots.filter((s) => s.period === 'morning'),
    afternoon: slots.filter((s) => s.period === 'afternoon'),
    evening: slots.filter((s) => s.period === 'evening'),
  };
}
