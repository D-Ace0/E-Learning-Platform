import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Room, RoomDocument } from '../Communication_schemas/room.schema';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
  ) {
  }

  async findByName(name: string): Promise<RoomDocument> {
    return this.roomModel.findOne({ name }).exec();
  }

  async addStudentToRoom(roomName: string, studentId: string): Promise<RoomDocument> {
    const room = await this.roomModel.findOne({ name: roomName }).exec();
    if (!room) {
      throw new NotFoundException(`Room "${roomName}" does not exist`);
    }

    // Convert studentId to an ObjectId if it's not already
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    // Add the student only if they are not already in the array
    if (!room.joined_students.includes(studentObjectId)) {
      room.joined_students.push(studentObjectId);
    }

    // Save the updated room document
    await room.save();
    return room;
  }
  async getAllRooms(): Promise<RoomDocument[]> {
    return this.roomModel.find().exec();
  }
}