import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { EnvConfig } from '../../env.model';

export interface WhatsAppSendResponse {
  messaging_product: 'whatsapp';
  contacts: {
    input: string; // The phone number sent in the payload
    wa_id: string; // The official WhatsApp ID of the user
  }[];
  messages: {
    id: string; // The unique message ID (wamid) used for status tracking
  }[];
}

export interface WhatsAppIncomingMessage {
  from?: string; // Sender phone number
  id?: string; // Unique message ID
  timestamp?: string; // Unix timestamp
  type:
    | 'text'
    | 'image'
    | 'document'
    | 'audio'
    | 'video'
    | 'location'
    | 'interactive';
  text?: {
    body: string;
  };
  image?: {
    caption?: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
  // Additional media objects (document, audio, etc.) follow similar structures
}

@Injectable()
export class ChatbotService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService<EnvConfig>,
  ) {}

  sendMessage(to: string, message: string) {
    try {
      const apiURL = this.configService.get('WHATSAPP_API_URL', {
        infer: true,
      });
      const version = this.configService.get('API_VERSION', { infer: true });
      const phone = this.configService.get('BUSINESS_PHONE', { infer: true });
      const token = this.configService.get('API_TOKEN', { infer: true });

      if (!apiURL || !version || !phone) {
        throw new Error('Environment False');
      }

      const url = `${apiURL}/${version}/${phone}/messages`;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const responseAPI = this.httpService.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: {
            preview_url: false,
            body: message,
          },
        },
        config,
      );
      return responseAPI;
    } catch {
      throw new Error('Error to send message');
    }
  }

  chatbotSendMessage(to: string, message: string) {
    try {
      const apiURL = this.configService.get('WHATSAPP_API_URL', {
        infer: true,
      });
      const version = this.configService.get('API_VERSION', { infer: true });
      const phone = this.configService.get('BUSINESS_PHONE', { infer: true });
      const token = this.configService.get('API_TOKEN', { infer: true });

      if (!apiURL || !version || !phone) {
        throw new Error('Environment False');
      }

      const url = `${apiURL}/${version}/${phone}/messages`;
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const responseAPI = this.httpService.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: {
            body: `Echo: ${message}`,
          },
        },
        config,
      );
      return responseAPI;
    } catch {
      throw new Error('Error to send message');
    }
  }
}
