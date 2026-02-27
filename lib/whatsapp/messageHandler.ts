/**
 * WhatsApp Message Handler
 * Processes incoming messages and generates appropriate responses
 */

import { ConversationManager } from './conversationManager';
import { TwilioWhatsAppService } from './twilioService';
import {
  ConversationState,
  ConversationContext,
  SkinTreatments,
  HairTreatments,
  PaymentOptions,
} from './conversationStates';

export class WhatsAppMessageHandler {
  /**
   * Main message processing entry point
   */
  static async processMessage(from: string, body: string, mediaUrl?: string): Promise<void> {
    const conversation = await ConversationManager.getOrCreateConversation(from);
    const context = await ConversationManager.getContext(from);

    // Log incoming message
    await ConversationManager.logIncomingMessage(
      conversation.id,
      body,
      undefined,
      mediaUrl
    );

    const currentState = conversation.currentState;
    const normalizedBody = body.trim().toLowerCase();

    // Handle global commands
    if (normalizedBody === 'cancel' || normalizedBody === 'stop') {
      await this.handleCancel(from);
      return;
    }

    if (normalizedBody === 'menu' || normalizedBody === 'main menu') {
      await this.handleMainMenu(from);
      return;
    }

    // Route to appropriate handler based on current state
    switch (currentState) {
      case ConversationState.IDLE:
      case ConversationState.GREETING:
        await this.handleGreeting(from, normalizedBody);
        break;

      case ConversationState.PATIENT_CHECK:
        await this.handlePatientCheck(from, context);
        break;

      case ConversationState.CAPTURE_NAME:
        await this.handleCaptureName(from, body);
        break;

      case ConversationState.APPOINTMENT_TYPE:
        await this.handleAppointmentType(from, normalizedBody);
        break;

      case ConversationState.PROCEDURE_CATEGORY:
        await this.handleProcedureCategory(from, normalizedBody);
        break;

      case ConversationState.PROCEDURE_TREATMENT:
        await this.handleProcedureTreatment(from, normalizedBody, context);
        break;

      case ConversationState.SLOT_SELECTION_CONSULTATION:
      case ConversationState.SLOT_SELECTION_PROCEDURE:
        await this.handleSlotSelection(from, normalizedBody, context);
        break;

      case ConversationState.PAYMENT_OPTIONS:
        await this.handlePaymentOption(from, normalizedBody, context);
        break;

      case ConversationState.PHARMACY_UPLOAD:
        await this.handlePharmacyUpload(from, normalizedBody, mediaUrl);
        break;

      case ConversationState.PHARMACY_DURATION:
        await this.handlePharmacyDuration(from, body, context);
        break;

      default:
        await TwilioWhatsAppService.sendMessage(
          from,
          "I didn't understand that. Please reply with 'Menu' to see available options."
        );
    }
  }

  /**
   * Handle greeting and main menu
   */
  private static async handleGreeting(from: string, body: string) {
    const greetings = ['hi', 'hello', 'hey', 'start', 'hola', 'namaste'];
    
    if (!greetings.some(greeting => body.includes(greeting))) {
      await TwilioWhatsAppService.sendMessage(
        from,
        "Welcome! Please reply with 'Hi' to get started. 👋"
      );
      return;
    }

    // Check if patient exists
    const patient = await ConversationManager.checkPatientExists(from);

    if (patient) {
      await ConversationManager.updateState(from, ConversationState.APPOINTMENT_TYPE, {
        patientName: patient.name,
        patientId: patient.id,
        isNewPatient: false,
      });

      await this.sendMainMenu(from, patient.name);
    } else {
      await ConversationManager.updateState(from, ConversationState.CAPTURE_NAME, {
        isNewPatient: true,
      });

      await TwilioWhatsAppService.sendMessage(
        from,
        `Welcome to *Dr. Sindhu's Skin Clinic*! 🏥\n\n` +
        `I'm here to help you book appointments and order medicines.\n\n` +
        `I see you're a new patient. What's your name?`
      );
    }
  }

  /**
   * Send main menu
   */
  private static async sendMainMenu(from: string, name?: string) {
    const greeting = name ? `Hello ${name}! 👋` : 'Hello! 👋';
    
    const message = `${greeting}\n\n` +
      `How can I help you today?\n\n` +
      `Please choose an option:\n\n` +
      `1️⃣ Book Appointment\n` +
      `2️⃣ Order Medicines (Pharmacy)\n` +
      `3️⃣ Talk to Our Staff\n` +
      `4️⃣ View My Bookings\n\n` +
      `Reply with the number (1, 2, 3, or 4)`;

    await TwilioWhatsAppService.sendMessage(from, message);
  }

  /**
   * Handle patient identification check
   */
  private static async handlePatientCheck(from: string, context: ConversationContext) {
    await this.sendMainMenu(from, context.patientName);
  }

  /**
   * Capture new patient name
   */
  private static async handleCaptureName(from: string, name: string) {
    await ConversationManager.updateState(from, ConversationState.APPOINTMENT_TYPE, {
      patientName: name,
      isNewPatient: true,
    });

    await this.sendMainMenu(from, name);
  }

  /**
   * Handle main menu selection
   */
  private static async handleAppointmentType(from: string, body: string) {
    if (body === '1' || body.includes('appointment') || body.includes('book')) {
      await ConversationManager.updateState(from, ConversationState.PROCEDURE_CATEGORY);

      const message = `Great! What type of appointment would you like?\n\n` +
        `1️⃣ Consultation (Doctor visit)\n` +
        `2️⃣ Procedure (Treatment/Service)\n\n` +
        `Reply with 1 or 2`;

      await TwilioWhatsAppService.sendMessage(from, message);
      return;
    }

    if (body === '2' || body.includes('medicine') || body.includes('pharmacy')) {
      await ConversationManager.updateState(from, ConversationState.PHARMACY_UPLOAD);

      const message = `📦 *Pharmacy Order*\n\n` +
        `Please upload your prescription (photo/PDF).\n\n` +
        `Or reply "No prescription" if you want to tell us the medicine names.`;

      await TwilioWhatsAppService.sendMessage(from, message);
      return;
    }

    if (body === '3' || body.includes('staff') || body.includes('talk')) {
      await ConversationManager.updateState(from, ConversationState.STAFF_ROUTING);

      const message = `📞 *Connect with Staff*\n\n` +
        `A staff member will call you shortly.\n\n` +
        `You can also call us directly at: +91 98765 43210`;

      await TwilioWhatsAppService.sendMessage(from, message);

      // TODO: Trigger staff notification
      return;
    }

    if (body === '4' || body.includes('booking') || body.includes('view')) {
      // TODO: Implement view bookings
      await TwilioWhatsAppService.sendMessage(
        from,
        `📅 Your booking history feature is coming soon!\n\nReply 'Menu' to return to main menu.`
      );
      return;
    }

    await TwilioWhatsAppService.sendMessage(
      from,
      `Please choose a valid option (1, 2, 3, or 4)\n\nOr reply 'Menu' to see options again.`
    );
  }

  /**
   * Handle procedure category selection (Skin/Hair)
   */
  private static async handleProcedureCategory(from: string, body: string) {
    if (body === '1' || body.includes('consultation')) {
      // Direct consultation booking
      await ConversationManager.updateState(
        from,
        ConversationState.SLOT_SELECTION_CONSULTATION,
        { appointmentType: 'consultation' }
      );

      // TODO: Fetch available slots from database
      const message = `📅 *Available Consultation Slots*\n\n` +
        `Please select a date:\n\n` +
        `1️⃣ Today (Feb 26)\n` +
        `2️⃣ Tomorrow (Feb 27)\n` +
        `3️⃣ Day after (Feb 28)\n\n` +
        `Reply with the number`;

      await TwilioWhatsAppService.sendMessage(from, message);
      return;
    }

    if (body === '2' || body.includes('procedure') || body.includes('treatment')) {
      await ConversationManager.updateState(from, ConversationState.PROCEDURE_TREATMENT);

      const message = `💉 *Select Treatment Category*\n\n` +
        `1️⃣ Skin Treatments\n` +
        `2️⃣ Hair Treatments\n\n` +
        `Reply with 1 or 2`;

      await TwilioWhatsAppService.sendMessage(from, message);
      return;
    }

    await TwilioWhatsAppService.sendMessage(
      from,
      `Please reply with 1 for Consultation or 2 for Procedure`
    );
  }

  /**
   * Handle specific treatment selection
   */
  private static async handleProcedureTreatment(
    from: string,
    body: string,
    context: ConversationContext
  ) {
    if (body === '1' || body.includes('skin')) {
      await ConversationManager.updateState(from, ConversationState.PROCEDURE_TREATMENT, {
        category: 'skin',
      });

      const treatmentList = SkinTreatments.map(
        (t, i) => `${i + 1}️⃣ ${t.name} - ₹${t.price}`
      ).join('\n');

      const message = `🧴 *Skin Treatments*\n\n${treatmentList}\n\nReply with the number`;

      await TwilioWhatsAppService.sendMessage(from, message);
      return;
    }

    if (body === '2' || body.includes('hair')) {
      await ConversationManager.updateState(from, ConversationState.PROCEDURE_TREATMENT, {
        category: 'hair',
      });

      const treatmentList = HairTreatments.map(
        (t, i) => `${i + 1}️⃣ ${t.name} - ₹${t.price}`
      ).join('\n');

      const message = `💇 *Hair Treatments*\n\n${treatmentList}\n\nReply with the number`;

      await TwilioWhatsAppService.sendMessage(from, message);
      return;
    }

    // Handle treatment selection
    const treatmentNum = parseInt(body);
    if (!isNaN(treatmentNum)) {
      const treatments = context.category === 'skin' ? SkinTreatments : HairTreatments;
      const selectedTreatment = treatments[treatmentNum - 1];

      if (selectedTreatment) {
        await ConversationManager.updateState(
          from,
          ConversationState.PROCEDURE_CONSULTATION_NOTICE,
          { treatment: selectedTreatment.id }
        );

        const message = `⚠️ *Important Notice*\n\n` +
          `Consultation is required before any procedure.\n\n` +
          `Would you like to:\n\n` +
          `1️⃣ Book consultation first\n` +
          `2️⃣ I'll schedule later\n\n` +
          `Reply with 1 or 2`;

        await TwilioWhatsAppService.sendMessage(from, message);
        return;
      }
    }

    await TwilioWhatsAppService.sendMessage(
      from,
      `Please select a valid treatment number`
    );
  }

  /**
   * Handle slot selection
   */
  private static async handleSlotSelection(
    from: string,
    body: string,
    context: ConversationContext
  ) {
    // TODO: Implement real slot selection logic with database
    const slotNum = parseInt(body);

    if (!isNaN(slotNum) && slotNum >= 1 && slotNum <= 3) {
      await ConversationManager.updateState(from, ConversationState.PAYMENT_OPTIONS, {
        selectedDate: `2026-02-${25 + slotNum}`,
        selectedTime: '10:00 AM',
      });

      const message = `💳 *Payment Options*\n\n` +
        `Your slot is temporarily held.\n\n` +
        `Choose payment option:\n\n` +
        `1️⃣ ${PaymentOptions.PARTIAL.label}\n` +
        `2️⃣ ${PaymentOptions.FULL.label}\n\n` +
        `Reply with 1 or 2`;

      await TwilioWhatsAppService.sendMessage(from, message);
      return;
    }

    await TwilioWhatsAppService.sendMessage(
      from,
      `Please select a valid slot number (1, 2, or 3)`
    );
  }

  /**
   * Handle payment option selection
   */
  private static async handlePaymentOption(
    from: string,
    body: string,
    context: ConversationContext
  ) {
    let amount: number;
    let option: 'partial' | 'full';

    if (body === '1') {
      amount = PaymentOptions.PARTIAL.amount;
      option = 'partial';
    } else if (body === '2') {
      amount = PaymentOptions.FULL.amount;
      option = 'full';
    } else {
      await TwilioWhatsAppService.sendMessage(
        from,
        `Please reply with 1 or 2 to select a payment option`
      );
      return;
    }

    // TODO: Generate actual payment link with Razorpay
    const paymentUrl = `https://clinic-booking-vkfq.vercel.app/payment?amount=${amount}`;

    await ConversationManager.updateState(from, ConversationState.PAYMENT_PROCESSING, {
      paymentOption: option,
      paymentAmount: amount,
    });

    await TwilioWhatsAppService.sendPaymentLink(from, amount, paymentUrl);
  }

  /**
   * Handle pharmacy prescription upload
   */
  private static async handlePharmacyUpload(
    from: string,
    body: string,
    mediaUrl?: string
  ) {
    if (mediaUrl) {
      await ConversationManager.updateState(from, ConversationState.PHARMACY_DURATION, {
        prescriptionUrl: mediaUrl,
      });

      const message = `✅ Prescription received!\n\n` +
        `How many days of medicine do you need?\n\n` +
        `Reply with number (e.g., "30" for 30 days)`;

      await TwilioWhatsAppService.sendMessage(from, message);
      return;
    }

    if (body.includes('no') || body.includes('skip')) {
      await ConversationManager.updateState(from, ConversationState.PHARMACY_DURATION);

      const message = `Please list the medicine names you need.\n\n` +
        `One medicine per line.`;

      await TwilioWhatsAppService.sendMessage(from, message);
      return;
    }

    await TwilioWhatsAppService.sendMessage(
      from,
      `Please upload your prescription or reply "No prescription" to continue`
    );
  }

  /**
   * Handle pharmacy duration
   */
  private static async handlePharmacyDuration(
    from: string,
    body: string,
    context: ConversationContext
  ) {
    const days = parseInt(body);

    if (!isNaN(days) && days > 0 && days <= 90) {
      const conversation = await ConversationManager.getOrCreateConversation(from);

      // Create pharmacy order
      await ConversationManager.createPharmacyOrder(
        conversation.id,
        from,
        context.patientName || 'Unknown',
        context.medicines || [],
        context.prescriptionUrl,
        `${days} days`
      );

      await ConversationManager.updateState(from, ConversationState.IDLE);

      const message = `✅ *Order Received!*\n\n` +
        `Your pharmacy order has been submitted.\n\n` +
        `Our staff will call you within 1 hour to confirm availability and delivery.\n\n` +
        `Order Details:\n` +
        `Duration: ${days} days\n\n` +
        `Thank you! 🙏\n\n` +
        `Reply 'Menu' to return to main menu.`;

      await TwilioWhatsAppService.sendMessage(from, message);
      return;
    }

    await TwilioWhatsAppService.sendMessage(
      from,
      `Please enter a valid number of days (1-90)`
    );
  }

  /**
   * Handle cancel command
   */
  private static async handleCancel(from: string) {
    await ConversationManager.resetConversation(from);

    await TwilioWhatsAppService.sendMessage(
      from,
      `Your session has been cancelled. 🙏\n\nReply 'Hi' anytime to start over.`
    );
  }

  /**
   * Handle main menu request
   */
  private static async handleMainMenu(from: string) {
    const context = await ConversationManager.getContext(from);
    await ConversationManager.updateState(from, ConversationState.APPOINTMENT_TYPE);
    await this.sendMainMenu(from, context.patientName);
  }
}
