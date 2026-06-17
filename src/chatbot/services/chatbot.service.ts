import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { EnvConfig } from '../../env.model';
import type {
  WebhookContact,
  WebhookPayload,
} from '../dto/webhook-payload.dto';

export interface WhatsAppSendResponse {
  messaging_product: 'whatsapp';
  contacts: { input: string; wa_id: string }[];
  messages: { id: string }[];
}

const GREETINGS = [
  'hola',
  'hi',
  'hello',
  'buenas',
  'buenos dias',
  'buenas tardes',
  'buenas noches',
];

@Injectable()
export class ChatbotService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService<EnvConfig>,
  ) {}

  private getApiConfig() {
    const apiURL = this.configService.get('WHATSAPP_API_URL', { infer: true });
    const version = this.configService.get('API_VERSION', { infer: true });
    const phone = this.configService.get('BUSINESS_PHONE', { infer: true });
    const token = this.configService.get('API_TOKEN', { infer: true });

    if (!apiURL || !version || !phone || !token) {
      throw new Error('Missing WhatsApp API configuration');
    }

    return {
      url: `${apiURL}/${version}/${phone}/messages`,
      headers: { Authorization: `Bearer ${token}` },
    };
  }

  async sendMessage(
    to: string,
    message: string,
    messageId?: string,
  ): Promise<WhatsAppSendResponse> {
    const { url, headers } = this.getApiConfig();

    const body: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body: message },
    };

    if (messageId) {
      body.context = { message_id: messageId };
    }

    const response = await firstValueFrom(
      this.httpService.post<WhatsAppSendResponse>(url, body, { headers }),
    );
    return response.data;
  }

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
        await this.sendMessage(from, welcomeMessage, msgId);
      }
    }
  }
}
