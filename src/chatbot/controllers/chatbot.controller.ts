import { Controller, Get, Req, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import { ConfigENV } from '../model';

@Controller('webhook')
export class ChatbotController {
  constructor(private configService: ConfigService) {}

  @Get('chatbot')
  getChatbot(@Req() req: Request) {
    const verify_token = this.configService.get<ConfigENV>(
      'WEBHOOK_VERIFY_TOKEN',
    );
    const {
      'hub.mode': mode,
      'hub.challenge': challenge,
      'hub.verify_token': token,
    } = req.query;

    if (mode === 'subscribe' && token === verify_token) {
      console.log('WEBHOOK VERIFIED');
      return challenge;
    } else {
      throw new ForbiddenException();
    }
  }
}
