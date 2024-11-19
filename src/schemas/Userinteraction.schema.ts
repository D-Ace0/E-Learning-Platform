import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Date, Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Course } from './course.schema';

export type UserInteractionDocument = UserInteraction & Document;

@Schema()
export class UserInteraction{
  @Prop({ required: true })
  interaction_id: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user_id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Course })
  course_id: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.Decimal128 })
  score: number; //float

  @Prop({ required: true, type: Number })
  timespentminutes: number;

  @Prop({ required: true, type: Date, default: Date.now })
  last_accessed: Date;
}

export const UserInteractionSchema = SchemaFactory.createForClass(UserInteraction);
