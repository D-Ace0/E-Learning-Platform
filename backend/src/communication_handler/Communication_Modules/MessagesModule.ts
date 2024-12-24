import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageSchema } from '../Communication_schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]), // Register MessageSchema
  ],
  exports: [MongooseModule], // Export MongooseModule so it can be used elsewhere
})
export class MessagesModule {}