import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';
import { Course } from './course.schema';

export type StudentMetricsDocument = StudentMetrics & Document;

@Schema()
export class StudentMetrics {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user_id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Course })
  course_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Number })
  completionRate: number;

  @Prop({ required: true, type: Number })
  averageScore: number;

  @Prop({ required: true, type: Array })
  engagementTrends: any[];
}

export const StudentMetricsSchema =
  SchemaFactory.createForClass(StudentMetrics);
