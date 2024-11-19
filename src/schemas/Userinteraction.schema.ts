import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Date, Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Course } from './course.schema';

export type UserInteractionDocument = UserInteraction & Document;

@Schema()
export class UserInteraction{
  @Prop({ required: true, type: Number})
  interactionId: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user_id: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Course })
  course_id: mongoose.Types.ObjectId;
  // ask TA about string/ObjectId
  @Prop({ required: true, type: Number })
  score: number;

  @Prop({ required: true, type: Number })
  timeSpentMinutes!: number;

  @Prop({ required: true, type: Date })
  lastAccessed!: Date;
}

export const UserInteractionSchema = SchemaFactory.createForClass(UserInteraction);
