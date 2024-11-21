import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';
import { Course } from './course.schema';

export type NoteDocument = Note & Document;

@Schema()
export class Note {
  @Prop({ required: true })
  module_id: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user_id: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Course })
  course_id?: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: Date, default: Date.now })
  created_at: Date;

  @Prop({ required: true, type: Date, default: Date.now })
  updated_at: Date;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
