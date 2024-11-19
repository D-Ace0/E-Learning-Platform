import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Date, Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Course } from './course.schema';
@Schema()
export class UserInteraction extends Document {
  @Prop({ required: true, type: Number})
  interactionId: number; // Unique identifier for the interaction

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user_id: mongoose.Types.ObjectId; // Reference to the User schema (user_id will link here)
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Course })
  courseId: mongoose.Types.ObjectId; // Associated course ID

  @Prop({ required: true, type: Number })
  score: number; // Score achieved in the module

  @Prop({ required: true, type: Number })
  timeSpentMinutes!: number; // Time spent on the module

  @Prop({ required: true, type: Date })
  lastAccessed!: Date; // Last time the module was accessed
}
export const UserInteractionSchema =
  SchemaFactory.createForClass(UserInteraction);
