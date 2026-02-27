/**
 * WhatsApp Conversation Manager
 * Handles conversation state, context, and database operations
 */

import { prisma } from '@/lib/prisma';
import { ConversationState, ConversationContext, ConversationStateType } from './conversationStates';

export class ConversationManager {
  /**
   * Get or create conversation for a phone number
   */
  static async getOrCreateConversation(phone: string) {
    // Normalize phone number (remove whatsapp: prefix if present)
    const normalizedPhone = phone.replace('whatsapp:', '').replace('+', '');

    let conversation = await prisma.whatsAppConversation.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!conversation) {
      conversation = await prisma.whatsAppConversation.create({
        data: {
          phone: normalizedPhone,
          currentState: ConversationState.GREETING,
          context: JSON.stringify({}),
        },
      });
    }

    return conversation;
  }

  /**
   * Update conversation state
   */
  static async updateState(
    phone: string,
    newState: ConversationStateType,
    context?: Partial<ConversationContext>
  ) {
    const normalizedPhone = phone.replace('whatsapp:', '').replace('+', '');

    const conversation = await prisma.whatsAppConversation.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!conversation) {
      throw new Error(`Conversation not found for phone: ${phone}`);
    }

    const existingContext: ConversationContext = conversation.context 
      ? JSON.parse(conversation.context)
      : {};

    const updatedContext: ConversationContext = {
      ...existingContext,
      ...context,
      lastMessageTime: Date.now(),
    };

    return await prisma.whatsAppConversation.update({
      where: { phone: normalizedPhone },
      data: {
        currentState: newState,
        context: JSON.stringify(updatedContext),
        lastMessageAt: new Date(),
      },
    });
  }

  /**
   * Get conversation context
   */
  static async getContext(phone: string): Promise<ConversationContext> {
    const normalizedPhone = phone.replace('whatsapp:', '').replace('+', '');

    const conversation = await prisma.whatsAppConversation.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!conversation || !conversation.context) {
      return {};
    }

    return JSON.parse(conversation.context);
  }

  /**
   * Log incoming message
   */
  static async logIncomingMessage(
    conversationId: string,
    content: string,
    twilioSid?: string,
    mediaUrl?: string
  ) {
    return await prisma.whatsAppMessage.create({
      data: {
        conversationId,
        messageType: 'incoming',
        content,
        twilioSid,
        mediaUrl,
        status: 'received',
      },
    });
  }

  /**
   * Log outgoing message
   */
  static async logOutgoingMessage(
    conversationId: string,
    content: string,
    twilioSid?: string
  ) {
    return await prisma.whatsAppMessage.create({
      data: {
        conversationId,
        messageType: 'outgoing',
        content,
        twilioSid,
        status: 'sent',
      },
    });
  }

  /**
   * Check if patient exists in database
   */
  static async checkPatientExists(phone: string) {
    const normalizedPhone = phone.replace('whatsapp:', '').replace('+', '');

    const user = await prisma.user.findFirst({
      where: { phone: { contains: normalizedPhone } },
    });

    return user;
  }

  /**
   * Create pharmacy order
   */
  static async createPharmacyOrder(
    conversationId: string,
    patientPhone: string,
    patientName: string,
    medicines: string[],
    prescriptionUrl?: string,
    duration?: string
  ) {
    return await prisma.pharmacyOrder.create({
      data: {
        conversationId,
        patientPhone,
        patientName,
        medicines: JSON.stringify(medicines),
        prescriptionUrl,
        duration,
        status: 'pending',
      },
    });
  }

  /**
   * Reset conversation (for starting over)
   */
  static async resetConversation(phone: string) {
    const normalizedPhone = phone.replace('whatsapp:', '').replace('+', '');

    return await prisma.whatsAppConversation.update({
      where: { phone: normalizedPhone },
      data: {
        currentState: ConversationState.GREETING,
        context: JSON.stringify({}),
        lastMessageAt: new Date(),
      },
    });
  }

  /**
   * Get conversation history
   */
  static async getConversationHistory(phone: string, limit: number = 20) {
    const normalizedPhone = phone.replace('whatsapp:', '').replace('+', '');

    const conversation = await prisma.whatsAppConversation.findUnique({
      where: { phone: normalizedPhone },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: limit,
        },
      },
    });

    return conversation?.messages.reverse() || [];
  }
}
