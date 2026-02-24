'use client';

import { useReducer, useCallback, ReactNode, createContext, useContext } from 'react';
import {
  BookingState,
  BookingAction,
  Service,
  TimeSlot,
  PatientInfo,
} from '@/lib/types/booking';

const initialState: BookingState = {
  currentStep: 0,
  selectedService: null,
  selectedDate: null,
  selectedSlot: null,
  patient: {},
  bookingStatus: 'idle',
  bookingId: null,
  errorMessage: null,
};

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_SERVICE':
      return {
        ...state,
        selectedService: action.payload,
      };

    case 'SET_DATE':
      return {
        ...state,
        selectedDate: action.payload,
        selectedSlot: null, // Clear slot when date changes
      };

    case 'SET_SLOT':
      return {
        ...state,
        selectedSlot: action.payload,
      };

    case 'SET_PATIENT':
      return {
        ...state,
        patient: {
          ...state.patient,
          ...action.payload,
        },
      };

    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: state.currentStep + 1,
      };

    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(0, state.currentStep - 1),
      };

    case 'RESET':
      return initialState;

    case 'CONFIRM_BOOKING':
      return {
        ...state,
        bookingStatus: 'confirmed',
        bookingId: `BOOKING-${Date.now()}`,
        currentStep: 3,
      };

    case 'SET_ERROR':
      return {
        ...state,
        bookingStatus: 'error',
        errorMessage: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        bookingStatus: 'idle',
        errorMessage: null,
      };

    default:
      return state;
  }
}

/**
 * Custom hook for managing booking state
 * Provides dispatch and state for the entire booking flow
 */
export function useBookingState() {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const setService = useCallback((service: Service) => {
    dispatch({ type: 'SET_SERVICE', payload: service });
  }, []);

  const setDate = useCallback((date: Date) => {
    dispatch({ type: 'SET_DATE', payload: date });
  }, []);

  const setSlot = useCallback((slot: TimeSlot) => {
    dispatch({ type: 'SET_SLOT', payload: slot });
  }, []);

  const setPatient = useCallback((patient: Partial<PatientInfo>) => {
    dispatch({ type: 'SET_PATIENT', payload: patient });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const confirmBooking = useCallback(async () => {
    // Call the backend API to create the booking
    try {
      const bookingData = {
        serviceId: state.selectedService?.id,
        slotId: `${state.selectedDate?.toISOString().split('T')[0]}_${state.selectedSlot?.time}`,
        date: state.selectedDate?.toISOString().split('T')[0],
        time: state.selectedSlot?.time,
        patientInfo: {
          name: state.patient.name,
          email: state.patient.email,
          phone: state.patient.phone,
          dateOfBirth: state.patient.dateOfBirth,
          concerns: state.patient.concerns,
        },
        doctorInfo: {
          name: 'Dr. Sindhu Ragavi',
          specialization: 'Consultant Dermatologist',
          location: 'Velachery, Chennai',
        },
        serviceInfo: {
          name: state.selectedService?.name || '',
          priceFrom: state.selectedService?.priceFrom || 500,
          duration: state.selectedService?.duration || 30,
        },
      };

      // Get auth token from sessionStorage
      const authToken = typeof window !== 'undefined' 
        ? sessionStorage.getItem('auth_token') 
        : null;

      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (response.ok) {
        dispatch({ 
          type: 'CONFIRM_BOOKING',
        });
        // Update with actual booking ID from backend
        return result;
      } else {
        throw new Error(result.error || 'Failed to create booking');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.message || 'Failed to create booking' 
      });
      throw error;
    }
  }, [state]);

  const setError = useCallback((message: string) => {
    dispatch({ type: 'SET_ERROR', payload: message });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return {
    state,
    setService,
    setDate,
    setSlot,
    setPatient,
    nextStep,
    prevStep,
    reset,
    confirmBooking,
    setError,
    clearError,
  };
}

/**
 * Context for sharing booking state across components
 */
export const BookingContext = createContext<ReturnType<typeof useBookingState> | undefined>(
  undefined
);

export function useBookingContext() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within BookingProvider');
  }
  return context;
}
