import {
  Controller,
  Get,
  Post,
  Req,
  Query,
  Res,
  HttpStatus,
  ForbiddenException,
  HttpCode,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';

import { EnvConfig } from '../../env.model';

@Controller()
export class ChatbotController {
  constructor(private configService: ConfigService<EnvConfig>) {}

  @Get('chatbot')
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

  @Post('chatbot')
  @HttpCode(HttpStatus.OK) // WhatsApp requiere un 200 OK explícito para confirmar recepción
  validateChatbot(@Req() req: Request) {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    console.log(`\n\n✉️ Webhook event received ${timestamp}\n`);
    console.log(JSON.stringify(req.body, null, 2));

    // Respondemos con un objeto simple o vacío, Meta solo busca el status 200
    return { status: 'success' };
  }
}
