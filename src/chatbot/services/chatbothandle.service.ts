import { Injectable } from '@nestjs/common';

import type {
  WebhookPayload,
  WebhookContact,
} from '../dto/webhook-payload.dto';
import { ChatbotService } from './chatbot.service';
import { chatbotMenu } from '../chatbot.model';

const GREETINGS = [
  'hola',
  'hi',
  'hello',
  'buenas',
  'buenos dias',
  'buenas tardes',
  'buenas noches',
];

// Communication with controller
@Injectable()
export class ChatbotHandleService {
  constructor(private readonly chatbotService: ChatbotService) {}

  isGreeting(message: string): boolean {
    const normalized = message.trim().toLowerCase();
    return GREETINGS.includes(normalized);
  }

  getSenderName(contactId: WebhookContact) {
    const welcomeMessage = ``;
    if (contactId?.profile?.name || contactId.wa_id) {
      const contact = contactId?.profile?.name || contactId.wa_id;
      return `¡Bienvenido ${contact || ''} a JDRStore! `;
    }
    return welcomeMessage;
  }

  async processIncomingMessage(payload: unknown) {
    const webhook = payload as WebhookPayload;
    const messages = webhook?.entry?.[0]?.changes?.[0]?.value?.messages;
    const contactId = webhook?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];

    if (!messages || messages.length === 0) return;

    for (const msg of messages) {
      const text = msg.text?.body;
      const from = msg.from;
      const msgId = msg.id;

      if (!from || !text) continue;

      console.log(`Mensaje de ${from}: "${text}"`);

      if (this.isGreeting(text)) {
        const welcomeMessage = this.getSenderName(contactId);
        console.log(`Saludo detectado → enviando bienvenida a ${from}`);
        await this.chatbotService.sendMessage(from, welcomeMessage, msgId);
        await this.sendWelcomeMenu(from);
      }
    }
  }

  async sendWelcomeMenu(to: string) {
    const menuMessage = `Select one option`;
    const buttons: chatbotMenu['buttons'] = [
      {
        type: 'reply',
        reply: { id: 'option_1', title: 'Test 1' },
      },
      {
        type: 'reply',
        reply: { id: 'option_2', title: 'Test 2' },
      },
      {
        type: 'reply',
        reply: { id: 'option_3', title: 'Test 3' },
      },
    ];

    await this.chatbotService.sendInteractiveButton(to, menuMessage, buttons);
  }
}
