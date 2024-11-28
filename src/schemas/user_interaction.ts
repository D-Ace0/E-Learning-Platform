import { Schema, Prop, SchemaFactory, PropOptions } from '@nestjs/mongoose'
import mongoose, { Date, Document, Types } from 'mongoose'
import { User } from './user.schema'
import { Course } from './courses.schema'
import { Response } from './response.schema'

export type UserInteractionDocument = UserInteraction & Document

@Schema()
export class UserInteraction {

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => User } as PropOptions)
  user_id: mongoose.Types.ObjectId

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => Course } as PropOptions)
  course_id: mongoose.Types.ObjectId

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => Response } as PropOptions)
  response_id: mongoose.Types.ObjectId

  @Prop({ required: true, type: Number })
  time_spent_minutes: number

  @Prop({ required: false, type: Date, default: Date.now })
  last_accessed: Date
}

export const UserInteractionSchema = SchemaFactory.createForClass(UserInteraction)
