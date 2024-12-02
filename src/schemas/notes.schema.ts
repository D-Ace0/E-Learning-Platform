import { Schema, Prop, SchemaFactory, PropOptions } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';
import { Course } from './course.schema';

export type NoteDocument = Note & Document;

@Schema()
export class Note {

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => User } as PropOptions)
  user_id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => Course } as PropOptions)
  course_id?: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: String })
  content: string

  @Prop({ required: false, type: Date, default: Date.now })
  created_at?: Date

  @Prop({ required: false, type: Date, default: Date.now })
  last_updated?: Date
}

export const NoteSchema = SchemaFactory.createForClass(Note);
