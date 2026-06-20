import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  HttpStatus,
  ForbiddenException,
  Body,
  HttpCode,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

import {
  ChatbotService,
  WhatsAppSendResponse,
} from '../services/chatbot.service';
import { ChatbotHandleService } from '../services/chatbothandle.service';
import { EnvConfig } from '../../env.model';
import { SendMessageDto } from '../dto/sendmessage.dto';

@Controller('webhook')
export class ChatbotController {
  constructor(
    private configService: ConfigService<EnvConfig>,
    private readonly chatbotService: ChatbotService,
    private readonly chatbotHandleService: ChatbotHandleService,
  ) {}

  @Get('')
  getChatbot(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') token: string,
    @Res() res: Response,
  ) {
    const verifyToken: string | undefined = this.configService.get(
      'WEBHOOK_VERIFY_TOKEN',
    );

    console.log('--- Intentando verificar Webhook ---');
    console.log(
      `Mode: ${mode}, Token recibido: ${token}, Challenge: ${challenge}`,
    );

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('WEBHOOK VERIFICADO CON ÉXITO');
      return res.status(HttpStatus.OK).send(challenge);
    } else {
      console.log('FALLÓ LA VERIFICACIÓN');
      throw new ForbiddenException('Verification failed');
    }
  }

  @Post('')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() body: unknown) {
    // console.log('Webhook recibido:', JSON.stringify(body).slice(0, 500));
    try {
      await this.chatbotHandleService.processIncomingMessage(body);
    } catch (error) {
      console.error('Error procesando webhook:', error);
    }
    return { status: 'received' };
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async handleSend(
    @Body() incomingMessageData: SendMessageDto,
  ): Promise<WhatsAppSendResponse> {
    return this.chatbotService.sendMessage(
      incomingMessageData.to,
      incomingMessageData.message?.text?.body,
      incomingMessageData.id,
    );
  }
}
