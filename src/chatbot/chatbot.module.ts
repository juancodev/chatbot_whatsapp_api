import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { ChatbotService } from './services/chatbot.service';
import { ChatbotController } from './controllers/chatbot.controller';
import { SendMessageController } from './controllers/sendmessage.controller';

@Module({
  imports: [HttpModule],
  controllers: [ChatbotController, SendMessageController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
