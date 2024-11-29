import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from '../schemas/user.schema';

export type RoomDocument = Room & Document;

@Schema()
export class Room {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] }) // Reference to User
  joined_students: mongoose.Types.ObjectId[]; // Array of ObjectIds for Users
}

export const RoomSchema = SchemaFactory.createForClass(Room);
