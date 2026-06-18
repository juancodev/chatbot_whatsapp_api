import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { ChatbotService } from './services/chatbot.service';
import { ChatbotController } from './controllers/chatbot.controller';
import { SendMessageController } from './controllers/sendmessage.controller';
import { ChatbotHandleService } from './services/chatbothandle.service';

@Module({
  imports: [HttpModule],
  controllers: [ChatbotController, SendMessageController],
  providers: [ChatbotService, ChatbotHandleService],
})
export class ChatbotModule {}
