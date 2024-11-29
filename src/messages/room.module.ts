import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomService } from './room.service';
import { RoomSchema } from './room.schema';
import { MessagesModule } from '../messages/MessagesModule'; // Import MessagesModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Room', schema: RoomSchema }]),
    MessagesModule, // Include MessagesModule
  ],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}
