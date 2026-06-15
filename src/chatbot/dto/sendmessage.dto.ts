export class SendMessageDto {
  to!: string;
  message!: {
    text: {
      body: string;
    };
  };
}
