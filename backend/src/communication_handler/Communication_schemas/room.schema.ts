import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../../schemas/user.schema';
import { Message } from './message.schema';

export type RoomDocument = Room & Document;

@Schema()
export class Room {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  joined_students: mongoose.Types.ObjectId[]; // Users in the room

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }] })
  messages: mongoose.Types.ObjectId[]; // Messages in the room
}

export const RoomSchema = SchemaFactory.createForClass(Room);