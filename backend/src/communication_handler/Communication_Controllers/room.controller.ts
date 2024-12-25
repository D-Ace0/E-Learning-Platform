import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { RoomService } from '../Communication_Service/room.service';
import { RoomDocument } from '../Communication_schemas/room.schema';

@Controller('rooms') // Route is '/rooms'
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Get()
  async getAllRooms(): Promise<RoomDocument[]> {
    return this.roomService.getAllRooms();
  }

  @Post('add-student')
  async addStudentToRoom(
      @Body() body: { roomName: string; studentId: string },
  ): Promise<{ message: string }> {
    const updatedRoom = await this.roomService.addStudentToRoom(body.roomName, body.studentId);
    return { message: `Student successfully added to room "${updatedRoom.name}".` };
  }
}
