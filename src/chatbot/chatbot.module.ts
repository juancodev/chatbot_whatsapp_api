import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { ChatbotService } from './services/chatbot.service';
import { ChatbotController } from './controllers/chatbot.controller';

@Module({
  imports: [HttpModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
