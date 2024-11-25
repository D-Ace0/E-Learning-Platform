import { Schema, Prop, SchemaFactory, PropOptions } from '@nestjs/mongoose'
import mongoose, { Date, HydratedDocument, Types } from 'mongoose'
import { User } from '../user/models/user.schema'
import { Course } from '../course/models/course.schema'

export type UserInteractionDocument = HydratedDocument<UserInteraction>

@Schema()
export class UserInteraction {

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => User } as PropOptions)
  user_id: mongoose.Types.ObjectId

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => Course } as PropOptions)
  course_id: mongoose.Types.ObjectId

  @Prop({ required: true, type: Number})
  score: number

  @Prop({ required: true, type: Number })
  time_spent_minutes: number

  @Prop({ required: false, type: Date, default: Date.now })
  last_accessed: Date
}

export const UserInteractionSchema = SchemaFactory.createForClass(UserInteraction)
