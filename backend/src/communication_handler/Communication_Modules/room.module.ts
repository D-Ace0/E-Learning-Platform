import { Module } from '@nestjs/common';
import { RoomController } from '../Communication_Controllers/room.controller';
import { RoomService } from '../Communication_Service/room.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from '../Communication_schemas/room.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }])],
  controllers: [RoomController],
  providers: [RoomService],
  exports: [RoomService],
})
export class RoomModule {}