import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schema';
import mongoose, { Document } from 'mongoose';
import { Student } from './student.schema';

export type CourseDocument = Course & Document;

enum difficulty_levels {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Schema()
export class Course {

  @Prop({ unique:true, required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true, enum: difficulty_levels })
  difficulty_level: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  created_by: mongoose.Schema.Types.ObjectId

  @Prop({ required: true, type: Date, default: Date.now })
  created_at: Date;

  @Prop({required: true})
  video: string

  @Prop({required: true})
  pdf: string

  @Prop({default: [], type: [mongoose.Schema.Types.ObjectId], ref: () => Course})
  parentVersion?: mongoose.Schema.Types.ObjectId[]; // this one will hold the course object id of the old version

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }], default: [] })
  enrolledStudents: mongoose.Schema.Types.ObjectId[];
}

export const CoursesSchema = SchemaFactory.createForClass(Course);
