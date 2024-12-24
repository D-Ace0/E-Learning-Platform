<<<<<<< Updated upstream
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
=======
import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { RoomService } from '../Communication_Service/room.service';
import { AuthorizationGuard } from '../../guards/authorization.guard'; // Ensure only admins access this
import { AuthenticationGuard } from '../../guards/authentication.guard'; // Ensure only admins access this
import { CreateRoomDto } from '../dto/create-room.dto';
import { AddStudentDto } from '../dto/add-student.dto';

@Controller('rooms')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('create')
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    const { name, createdBy } = createRoomDto;
    return this.roomService.createRoom(name, createdBy);
  }

  @Post('add-student')
  async addStudentToRoom(@Body() addStudentDto: AddStudentDto) {
    const { roomName, studentId } = addStudentDto;
    return this.roomService.addStudentToRoom(roomName, studentId);
  }
>>>>>>> Stashed changes
}
