/**
 * Dr. Sindhu's Booking System - Mock Data
 */

import { Doctor, Service, TimeSlot } from '@/lib/types/booking';

export const DOCTOR: Doctor = {
  id: 'dr-sindhu-001',
  name: 'Dr. B.Sindhu Raaghavi',
  title: 'MBBS, MD - Dermatology, Venereology & Leprosy',
  experience: '12 Years',
  rating: 4.9,
  reviews: 595,
  photo: '/doctor-sindhu.jpg',
  location: 'Velachery Main Road, Chennai',
  specialization: 'Dermatologist, Aesthetic Dermatologist, Trichologist, Cosmetologist',
};

export const SERVICES: Service[] = [
  {
    id: 'service-001',
    name: 'Chemical Peel',
    description: 'Deep exfoliation for rejuvenated, glowing skin',
    duration: 40,
    priceFrom: 1200,
    icon: '🧴',
    popular: true,
  },
  {
    id: 'service-002',
    name: 'Hair Loss Treatment',
    description: 'Comprehensive treatment for hair fall and thinning',
    duration: 45,
    priceFrom: 1500,
    icon: '💇',
    popular: true,
  },
  {
    id: 'service-003',
    name: 'Acne / Pimples Treatment',
    description: 'Professional acne management and skincare',
    duration: 45,
    priceFrom: 800,
    icon: '💊',
    popular: true,
  },
  {
    id: 'service-004',
    name: 'Anti Aging Treatment',
    description: 'Advanced treatments for fine lines and wrinkles',
    duration: 60,
    priceFrom: 2000,
    icon: '✨',
    popular: true,
  },
  {
    id: 'service-005',
    name: 'Skin Rejuvenation',
    description: 'Restore youthful glow and texture',
    duration: 50,
    priceFrom: 1800,
    icon: '🌟',
    popular: false,
  },
  {
    id: 'service-006',
    name: 'Skin Allergy Treatment',
    description: 'Treatment for various skin allergies and conditions',
    duration: 30,
    priceFrom: 700,
    icon: '🩺',
    popular: false,
  },
  {
    id: 'service-007',
    name: 'Facial Treatments',
    description: 'Professional facial treatments for healthy skin',
    duration: 60,
    priceFrom: 1500,
    icon: '😊',
    popular: true,
  },
  {
    id: 'service-008',
    name: 'Hydra Facial',
    description: 'Deep cleansing and hydration treatment',
    duration: 45,
    priceFrom: 2500,
    icon: '💧',
    popular: true,
  },
  {
    id: 'service-009',
    name: 'Laser Hair Removal - Face',
    description: 'Permanent facial hair reduction with laser',
    duration: 30,
    priceFrom: 1000,
    icon: '✂️',
    popular: false,
  },
  {
    id: 'service-010',
    name: 'Melasma Treatment',
    description: 'Treatment for dark patches and melasma',
    duration: 45,
    priceFrom: 1200,
    icon: '🎨',
    popular: false,
  },
  {
    id: 'service-011',
    name: 'Hyperbaric',
    description: 'Advanced oxygen therapy for skin rejuvenation',
    duration: 60,
    priceFrom: 3000,
    icon: '🫧',
    popular: false,
  },
  {
    id: 'service-012',
    name: 'Wart Removal',
    description: 'Safe and effective wart removal',
    duration: 20,
    priceFrom: 500,
    icon: '🔬',
    popular: false,
  },
  {
    id: 'service-013',
    name: 'Gentle Yag Pro',
    description: 'Advanced laser treatment for various skin conditions',
    duration: 40,
    priceFrom: 2000,
    icon: '⚡',
    popular: false,
  },
  {
    id: 'service-014',
    name: 'Hair Care',
    description: 'Comprehensive hair care and scalp treatment',
    duration: 45,
    priceFrom: 1000,
    icon: '💆',
    popular: false,
  },
  {
    id: 'service-015',
    name: 'Hyper Pigmentation Treatment',
    description: 'Treatment for dark spots and uneven skin tone',
    duration: 45,
    priceFrom: 1200,
    icon: '🌈',
    popular: false,
  },
  {
    id: 'service-016',
    name: 'Clinic Appointment',
    description: 'General consultation at clinic',
    duration: 30,
    priceFrom: 1200,
    icon: '👨‍⚕️',
    popular: true,
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
