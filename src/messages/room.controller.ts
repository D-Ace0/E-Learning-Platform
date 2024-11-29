// room.controller.ts
import { Controller, Post, Get, Delete, Body } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {
  }



}