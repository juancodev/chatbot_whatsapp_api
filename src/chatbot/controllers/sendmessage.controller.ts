import { Controller, Post, HttpStatus, HttpCode, Body } from '@nestjs/common';

import {
  ChatbotService,
  WhatsAppSendResponse,
} from '../services/chatbot.service';
import { SendMessageDto } from '../dto/sendmessage.dto';

@Controller('whatsapp')
export class SendMessageController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async message(
    @Body() newMessage: SendMessageDto,
  ): Promise<WhatsAppSendResponse> {
    return this.chatbotService.sendMessage(
      newMessage.to,
      newMessage.message?.text?.body,
      newMessage.id,
    );
  }
}
