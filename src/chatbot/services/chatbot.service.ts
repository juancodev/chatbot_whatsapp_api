import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { EnvConfig } from '../../env.model';
import { chatbotMenu } from '../chatbot.model';

export interface WhatsAppSendResponse {
  messaging_product: 'whatsapp';
  contacts: { input: string; wa_id: string }[];
  messages: { id: string }[];
}

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

  async sendInteractiveButton(
    to: string,
    bodyText: string,
    buttonsOptions: chatbotMenu['buttons'],
  ): Promise<WhatsAppSendResponse> {
    const { url, headers } = this.getApiConfig();

    if (buttonsOptions.length < 1) {
      throw new BadRequestException('Bad data error buttons');
    }

    const body: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: {
          buttons: buttonsOptions,
        },
      },
    };

    const response = await firstValueFrom(
      this.httpService.post<WhatsAppSendResponse>(url, body, { headers }),
    );

    return response.data;
  }

  async handleMenuOption(to: string, option: string) {
    let response: string;
    switch (option) {
      case 'option_1':
        response = 'See catalog';
        break;
      case 'option_2':
        response = 'Contact with seller';
        break;
      case 'option_3':
        response = 'Back menu';
        break;
      default:
        response = `There is a wrong`;
    }

    await this.sendMessage(to, response);
  }
}
