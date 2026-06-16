import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  HttpStatus,
  ForbiddenException,
  Body,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { ChatbotService } from '../services/chatbot.service';
import { EnvConfig } from '../../env.model';
import { SendMessageDto } from '../dto/sendmessage.dto';

@Controller('webhook')
export class ChatbotController {
  constructor(
    private configService: ConfigService<EnvConfig>,
    private readonly chatbotService: ChatbotService,
  ) {}

  @Get('')
  getChatbot(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') token: string,
    @Res() res: Response, // Inyectamos la respuesta de express
  ) {
    // Obtenemos el token como string
    const verifyToken = this.configService.get<EnvConfig | string>('API_TOKEN');

    console.log('--- Intentando verificar Webhook ---');
    console.log(
      `Mode: ${mode}, Token recibido: ${token}, Challenge: ${challenge}`,
    );

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ WEBHOOK VERIFICADO CON ÉXITO');

      // CRITICAL: Meta necesita el challenge en texto plano, no en JSON
      return res.status(HttpStatus.OK).send(challenge);
    } else {
      console.log('❌ FALLÓ LA VERIFICACIÓN');
      throw new ForbiddenException('Verification failed');
    }
  }

  @Post('send')
  handleIncoming(@Body() incomingMessageData: SendMessageDto) {
    return this.chatbotService.sendMessage(
      incomingMessageData.to,
      incomingMessageData.message?.text?.body,
      incomingMessageData.id,
    );
  }
}
