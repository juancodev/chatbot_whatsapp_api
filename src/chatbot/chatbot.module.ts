import { Module } from '@nestjs/common';
import { ChatbotService } from './services/chatbot.service';
import { ChatbotController } from './controllers/chatbot.controller';

@Module({
  imports: [],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
