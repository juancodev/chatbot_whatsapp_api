import { Controller, Post, HttpStatus, HttpCode, Body } from '@nestjs/common';

import { ChatbotService } from '../services/chatbot.service';
import { SendMessageDto } from '../dto/sendmessage.dto';

@Controller('whatsapp')
export class SendMessageController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK) // WhatsApp requiere un 200 OK explícito para confirmar recepción
  message(@Body() newMessage: SendMessageDto) {
    return this.chatbotService.sendMessage(newMessage.to, newMessage.message);
  }
}
