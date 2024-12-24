import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Room } from '../Communication_schemas/room.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class RoomService {
  findByName(roomName: string) {
    throw new Error('Method not implemented.');
  }
  constructor(@InjectModel(Room.name) private roomModel: Model<Room>) {}

  async createRoom(name: string, createdBy: string): Promise<Room> {
    const existingRoom = await this.roomModel.findOne({ name });
    if (existingRoom) {
      throw new ForbiddenException('Room already exists');
    }

    const newRoom = new this.roomModel({ name, createdBy, students: [] });
    return await newRoom.save();
  }

  async addStudentToRoom(roomName: string, studentId: string): Promise<Room> {
    const room = await this.roomModel.findOne({ name: roomName });
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (!room.students.includes(studentId)) {
      room.students.push(studentId);
      await room.save();
    }
    return room;
  }

  async getRoomDetails(roomName: string): Promise<Room> {
    const room = await this.roomModel.findOne({ name: roomName }).populate('students');
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }
  async getAllRooms(): Promise<Room[]> {
    return this.roomModel.find().exec();
  }
}
