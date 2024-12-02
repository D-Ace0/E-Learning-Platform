import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomService } from '../Communication_Service/room.service';
import { RoomSchema } from '../Communication_schemas/room.schema';
import { MessagesModule } from './MessagesModule'; // Import MessagesModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Room', schema: RoomSchema }]),
    MessagesModule, // Include MessagesModule
  ],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}
