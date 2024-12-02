import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

enum DifficultyLevels {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Schema()
export class Course {
  @Prop({ unique: true, required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, enum: DifficultyLevels })
  difficulty_level: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  created_by: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: Date, default: Date.now })
  created_at: Date;

  @Prop({ required: true })
  video: string;

  @Prop({ required: true })
  pdf: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }], default: [] })
  enrolledStudents: mongoose.Schema.Types.ObjectId[];
  @Prop({
    default: [],
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Course',
  })
  parentVersion?: mongoose.Schema.Types.ObjectId[];



}

export const CourseSchema = SchemaFactory.createForClass(Course);
export type CourseDocument = Course & Document;
