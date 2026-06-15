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
        headers: { Authorization: token },
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
}
