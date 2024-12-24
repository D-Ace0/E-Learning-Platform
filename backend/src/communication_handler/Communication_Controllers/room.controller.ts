import { Controller, Get } from '@nestjs/common';
import { RoomService } from '../Communication_Service/room.service';
import { RoomDocument } from '../Communication_schemas/room.schema';

@Controller('rooms') // Route is '/rooms'
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getAllRooms(): Promise<RoomDocument[]> {
    return this.roomService.getAllRooms();
  }
}