import { Schema, Prop, PropOptions, SchemaFactory } from '@nestjs/mongoose'
import { User } from '../course/models/user.schema'
import { Course } from './course.schema'
import mongoose, { Document } from 'mongoose'

export type ProgressDocument = Progress & Document

@Schema()
export class Progress {

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => User } as PropOptions)
  user_id: mongoose.Types.ObjectId

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => Course } as PropOptions)
  course_id: mongoose.Types.ObjectId

  @Prop({ required: true, type: Number })
  completionpercentage: number

  @Prop({ required: false, type: Date, default: Date.now })
  lastAccessed?: Date
}

export const ProgressSchema = SchemaFactory.createForClass(Progress)
