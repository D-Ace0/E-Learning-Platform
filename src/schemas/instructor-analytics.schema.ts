import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';
import { Course } from './course.schema';

export type InstructorAnalyticsDocument = InstructorAnalytics & Document;

@Schema()
export class InstructorAnalytics {

  @Prop({ type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), unique: true })
  analytic_id: mongoose.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  instructor_id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Course })
  course_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: Array })
  studentEngagementTrends: any[];

  @Prop({ required: true, type: Array })
  quizPerformance: any[];

  @Prop({ required: true, type: Array })
  challengingModules: any[];
}

export const InstructorAnalyticsSchema =
  SchemaFactory.createForClass(InstructorAnalytics);
