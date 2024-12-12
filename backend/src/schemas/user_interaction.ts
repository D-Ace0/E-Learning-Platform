import { Schema, Prop, SchemaFactory, PropOptions } from '@nestjs/mongoose'
import mongoose, { Date, Document, Types } from 'mongoose'
import { User } from './user.schema'
import { Course } from './course.schema'
import { Response } from './response.schema'
import { Progress } from './progress.schema';

export type UserInteractionDocument = UserInteraction & Document

@Schema()
export class UserInteraction {

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user_id: mongoose.Schema.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Course})
  course_id: mongoose.Schema.Types.ObjectId

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: () => Response})
  response_id: mongoose.Schema.Types.ObjectId



  @Prop({ type: Number })
  time_spent_minutes: number

  @Prop({ type: Date, default: Date.now })
  last_accessed: Date
}

export const UserInteractionSchema = SchemaFactory.createForClass(UserInteraction)
