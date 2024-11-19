import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import { Course } from './course.schema';
import mongoose, { Document } from 'mongoose';

export type ProgressDocument = Progress & Document;

@Schema()
export class Progress extends Document {
  @Prop({ required: true, unique: true })
  progressId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User })
  user_id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Course })
  course_id?: string;

  @Prop({ required: true, type: Number })
  completionPercentage: number;

  @Prop({ required: true, type: Date, default: Date.now })
  lastAccessed: Date;
}

// Generate the schema
export const ProgressSchema = SchemaFactory.createForClass(Progress);
