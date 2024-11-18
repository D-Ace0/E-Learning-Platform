import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from './user.schema';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

enum difficulty_levels {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

@Schema()
export class Course {
  @Prop({ unique: true })
  course_id: string;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  category: string;

  @Prop({ enum: difficulty_levels })
  difficulty_level: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User })
  created_by: string;

  @Prop({ default: Date.now })
  created_at: Date;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
