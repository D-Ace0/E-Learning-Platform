import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { User } from './user.schema'
import { Course } from './course.schema'
import mongoose, { Document } from 'mongoose'

export type ProgressDocument = Progress & Document

@Schema()
export class Progress extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), unique: true })
  progress_id: mongoose.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => User })
  user_id: mongoose.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Course })
  course_id?: mongoose.Types.ObjectId

  @Prop({ required: true, type: Number })
  completionPercentage: number

  @Prop({ required: true, type: Date, default: Date.now })
  lastAccessed: Date
}

// Generate the schema
export const ProgressSchema = SchemaFactory.createForClass(Progress)
