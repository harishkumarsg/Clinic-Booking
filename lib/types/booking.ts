/**
 * Dr. Sindhu's Booking System - Type Definitions
 */

export interface Doctor {
  id: string;
  name: string;
  title: string;
  experience: string;
  rating: number;
  reviews: number;
  photo: string;
  location: string;
  specialization: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  priceFrom: number;
  icon: string; // emoji or icon code
  popular: boolean;
}

export interface TimeSlot {
  id: string;
  time: string; // HH:MM format
  available: boolean;
  period: 'morning' | 'afternoon' | 'evening';
}

export interface PatientInfo {
  name: string;
  phone: string;
  dateOfBirth: string; // YYYY-MM-DD
  concerns: string;
  email?: string;
  googleId?: string;
  photoUrl?: string;
}

export type BookingStatus = 'idle' | 'pending' | 'confirmed' | 'error';

export interface PaymentInfo {
  paymentId: string | null;
  amount: number | null;
  type: 'partial' | 'full' | null;
  status: 'pending' | 'completed' | 'failed';
}

export interface BookingState {
  currentStep: number; // 0: Hero, 1: DateTime, 2: Confirm, 3: Payment, 4: Success
  selectedService: Service | null;
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  patient: Partial<PatientInfo>;
  payment: PaymentInfo;
  bookingStatus: BookingStatus;
  bookingId: string | null;
  errorMessage: string | null;
}

export interface AppointmentSummary {
  doctor: Doctor;
  service: Service | null;
  date: Date | null;
  slot: TimeSlot | null;
  patient: Partial<PatientInfo>;
  location: string;
  fee: number;
}

export interface BookingAction {
  type:
    | 'SET_SERVICE'
    | 'SET_DATE'
    | 'SET_SLOT'
    | 'SET_PATIENT'
    | 'SET_PAYMENT'
    | 'NEXT_STEP'
    | 'PREV_STEP'
    | 'RESET'
    | 'CONFIRM_BOOKING'
    | 'SET_ERROR'
    | 'CLEAR_ERROR';
  payload?: any;
}
