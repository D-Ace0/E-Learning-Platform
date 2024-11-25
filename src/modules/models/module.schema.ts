import { Schema, Prop, SchemaFactory, PropOptions } from '@nestjs/mongoose'
import { Course } from 'src/course/models/course.schema'
import mongoose, { Document } from 'mongoose'

export type ModuleDocument = Module & Document

@Schema()
export class Module {

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: () => Course } as PropOptions)
  course_id: mongoose.Types.ObjectId

  @Prop({ required: true, type: String })
  title: string

  @Prop({ required: true, type: String})
  content: string

  @Prop({ required: true, type: [String]})
  resources?: string[]

  @Prop({ required: false, type: Date, default: Date.now })
  created_at?: Date
}

export const ModuleSchema = SchemaFactory.createForClass(Module)
