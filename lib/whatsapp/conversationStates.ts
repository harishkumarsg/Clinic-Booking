/**
 * WhatsApp Conversation States for Dr. Sindhu's Clinic Chatbot
 */

export const ConversationState = {
  // Initial states
  IDLE: 'idle',
  GREETING: 'greeting',
  
  // Patient identification
  PATIENT_CHECK: 'patient_check',
  CAPTURE_NAME: 'capture_name',
  
  // Appointment booking flow
  APPOINTMENT_TYPE: 'appointment_type',
  CONSULTATION_CATEGORY: 'consultation_category',
  PROCEDURE_CATEGORY: 'procedure_category',
  PROCEDURE_TREATMENT: 'procedure_treatment',
  PROCEDURE_CONSULTATION_NOTICE: 'procedure_consultation_notice',
  SLOT_SELECTION_CONSULTATION: 'slot_selection_consultation',
  SLOT_SELECTION_PROCEDURE: 'slot_selection_procedure',
  PAYMENT_OPTIONS: 'payment_options',
  PAYMENT_PROCESSING: 'payment_processing',
  BOOKING_CONFIRMATION: 'booking_confirmation',
  
  // Pharmacy flow
  PHARMACY_UPLOAD: 'pharmacy_upload',
  PHARMACY_DURATION: 'pharmacy_duration',
  PHARMACY_CONFIRMATION: 'pharmacy_confirmation',
  
  // Staff talk
  STAFF_ROUTING: 'staff_routing',
  STAFF_HOLD: 'staff_hold',
  
  // Inactivity handling
  REMINDER_SENT: 'reminder_sent',
  SESSION_EXPIRED: 'session_expired',
} as const;

export type ConversationStateType = typeof ConversationState[keyof typeof ConversationState];

export interface ConversationContext {
  patientName?: string;
  patientId?: string;
  isNewPatient?: boolean;
  
  // Appointment booking
  appointmentType?: 'consultation' | 'procedure';
  category?: 'skin' | 'hair';
  treatment?: string;
  selectedDate?: string;
  selectedTime?: string;
  slotId?: string;
  
  // Payment
  paymentOption?: 'partial' | 'full';
  paymentAmount?: number;
  paymentStatus?: 'pending' | 'completed' | 'failed';
  
  // Pharmacy
  prescriptionUrl?: string;
  medicines?: string[];
  medicineDuration?: string;
  
  // Metadata
  lastMessageTime?: number;
  retryCount?: number;
  ivrSelection?: number;
}

export const AppointmentTypes = {
  CONSULTATION: 'consultation',
  PROCEDURE: 'procedure',
} as const;

export const TreatmentCategories = {
  SKIN: 'skin',
  HAIR: 'hair',
} as const;

export const SkinTreatments = [
  { id: 'hydrafacial', name: 'HydraFacial', price: 2500 },
  { id: 'chemical_peel', name: 'Chemical Peel', price: 1200 },
  { id: 'botox', name: 'Botox', price: 8000 },
  { id: 'iv_glutathione', name: 'IV Glutathione', price: 3500 },
  { id: 'laser_resurfacing', name: 'Laser Skin Resurfacing', price: 5000 },
];

export const HairTreatments = [
  { id: 'laser_hair_removal_face', name: 'Laser Hair Removal - Face', price: 1000 },
  { id: 'laser_hair_removal_body', name: 'Laser Hair Removal - Body', price: 2000 },
  { id: 'hair_loss_treatment', name: 'Hair Loss Treatment', price: 1500 },
  { id: 'prp_hair', name: 'PRP for Hair Growth', price: 4000 },
];

export const PaymentOptions = {
  PARTIAL: { amount: 50, label: 'Pay ₹50 booking fee' },
  FULL: { amount: 900, label: 'Pay full ₹900 and book now' },
} as const;
