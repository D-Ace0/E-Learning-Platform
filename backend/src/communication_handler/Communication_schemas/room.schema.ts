import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Room extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ type: [String], default: [] })
  students: string[];
}

export const RoomSchema = SchemaFactory.createForClass(Room);
