import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { Course } from './course.schema'
import mongoose, { Document } from 'mongoose'

export type ModuleDocument = Module & Document

@Schema()
export class Module {
  @Prop({ type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), unique: true })
  module_id: mongoose.Types.ObjectId

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Course })
  course_id: mongoose.Types.ObjectId

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  resources?: string[]

  @Prop({ required: true, type: Date, default: Date.now })
  created_at: Date;
}

export const ModuleSchema = SchemaFactory.createForClass(Module)
